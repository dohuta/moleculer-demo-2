const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cuid = require("cuid");
const { MoleculerError } = require("moleculer").Errors;
const UnAuthorizedError = require("moleculer-web").Errors.UnAuthorizedError;

const { AUTH_ERRORS } = require("../common/constants");
const AuthCache = require("../services/auth-cache");

/*
 * @typedef {import('http').IncomingMessage} IncomingMessage Incoming HTTP Request
 */

const PRIVATE_KEY = fs.readFileSync(process.env.PRIVATE_KEY_PATH);
const PUBLIC_KEY = fs.readFileSync(process.env.PUBLIC_KEY_PATH);
const SECRET = process.env.JWT_SECRET;

class Authentication {
	constructor(dbContext, logger) {
		this.cache = new AuthCache(logger);
		this.dbContext = dbContext;
		this.jwtOptions = {
			algorithm: "RS256",
			expiresIn: process.env.JWT_EXPIRATION,
			issuer: "dohuta.net",
		};
		this.jwtRFOptions = {
			algorithm: "HS256",
			expiresIn: process.env.JWT_RF_EXPIRATION,
			issuer: "dohuta.net",
		};
		this.logger = logger;
		this.logger.info(`🚀 AUTH :: Initialized`);
	}

	/**
	 * Return hashed string of password with salt:12
	 * @param {string} password
	 */
	hashPassword(password) {
		const hashed = bcrypt.hashSync(password, 12);
		this.logger.debug(`AUTH :: hashed password ${password} -> ${hashed}`);
		return hashed;
	}

	/**
	 * Verify password
	 * @param {string} password
	 * @param {string} hashedPassword
	 */
	verifyPassword(password, hashedPassword) {
		const verified = bcrypt.compareSync(password, hashedPassword);
		this.logger.debug(
			`AUTH :: verify password ${password} & hashed ${hashedPassword} -> ${verified}`
		);
		return verified;
	}

	/**
	 * Delete one token
	 * @param {string} token
	 */
	async deleteAuthInfo(token) {
		const res = await this.cache.deleteToken(token);
		this.logger.debug(`AUTH :: delete token ${token} -> ${res}`);
		return res;
	}

	/**
	 * Delete many tokens by userId
	 * @param {string} userId
	 */
	async deleteAllAuthInfoByUserID(userId) {
		const res = await this.cache.deleteAllTokensByUserId(userId);
		this.logger.debug(`AUTH :: delete all token of ${userId} -> ${res}`);
		return res;
	}

	/**
	 * Generate token by user ID
	 * @param {*} user
	 */
	async generateToken(user, options = undefined) {
		let refinedUser = user;

		// get plain object instead of entity
		if (refinedUser instanceof this.dbContext.models.User) {
			refinedUser = user.get();
		}

		const accessPayload = {
			id: refinedUser.id,
			fullname: refinedUser.fullname,
			username: refinedUser.username,
		};
		const rfPayload = cuid();

		// synchronous call since no callback supplied
		const accessToken = jwt.sign(
			accessPayload,
			PRIVATE_KEY,
			this.jwtOptions
		);
		const rfToken = jwt.sign({ sub: rfPayload }, SECRET, this.jwtRFOptions);

		// save rf-token to redis cache
		// await this.cache.setToken(token, user);
		await this.cache.setRFToken(rfPayload, {
			accessToken: accessToken,
			userId: user.id,
			...options,
		});

		this.logger.info(
			`AUTH :: generate token of ${refinedUser.id} -> ${accessToken} -> ${rfToken}`
		);
		return { accessToken: accessToken, refreshToken: rfToken };
	}

	/**
	 *
	 * @param {Request} req
	 */
	verifyAuth(req) {
		try {
			this.logger.trace("AUTH :: Begin of request verification");
			let accessToken;
			const token =
				req.headers["Authorization"] || req.headers["authorization"];
			const rfToken =
				req.headers["X-Refresh-Token"] ||
				req.headers["x-refresh-token"];

			if (token && token.startsWith("Bearer") && rfToken) {
				// NOTE: 1 Case Token
				accessToken = token.slice(7);
			}
			if (!accessToken) {
				throw new Error("Missing token");
			}
			const decrypted = jwt.verify(
				accessToken,
				PUBLIC_KEY,
				this.jwtOptions
			);

			this.logger.trace("AUTH :: End of request verification");

			return {
				id: decrypted.id,
				fullname: decrypted.fullname,
				username: decrypted.username,
			};
		} catch (error) {
			const rfToken =
				req.headers["X-Refresh-Token"] ||
				req.headers["x-refresh-token"];
			const type = rfToken ? "REFRESH" : "INVALID_TOKEN";
			this.logger.trace(
				`AUTH :: Error on request verification -> ${error}`
			);
			throw new UnAuthorizedError(type);
		}
	}

	/**
	 *
	 * @param {Request} req
	 */
	async refreshAuth(req, options = null) {
		try {
			this.logger.trace("AUTH :: Begin of refreshing auth");
			let accessToken;
			const token =
				req.headers["Authorization"] || req.headers["authorization"];
			const rfToken =
				req.headers["X-Refresh-Token"] ||
				req.headers["x-refresh-token"];

			if (token && token.startsWith("Bearer") && rfToken) {
				// NOTE: 1 Case Token
				accessToken = token.slice(7);
			}
			if (!accessToken) {
				throw new Error("Missing token");
			}
			const decodedAccessPayload = jwt.decode(
				accessToken,
				this.jwtOptions
			);
			const decodedRFPayload = jwt.verify(
				rfToken,
				SECRET,
				this.jwtRFOptions
			);
			const savedRFPayload = await this.cache.getToken(
				decodedRFPayload.sub
			);

			if (
				savedRFPayload &&
				decodedAccessPayload &&
				accessToken === savedRFPayload.accessToken &&
				decodedAccessPayload.id === savedRFPayload.userId &&
				options.ip === savedRFPayload.ip &&
				options.userAgent === savedRFPayload.userAgent
			) {
				// delete old RF-Token
				await this.cache.deleteToken(decodedRFPayload.sub);
				const { accessToken, refreshToken } = await this.generateToken(
					{
						id: decodedAccessPayload.id,
						fullname: decodedAccessPayload.fullname,
						username: decodedAccessPayload.username,
					},
					options
				);

				const authPayload = {
					id: decodedAccessPayload.id,
					fullname: decodedAccessPayload.fullname,
					accessToken,
					refreshToken,
				};
				this.logger.trace(`AUTH :: Refresh Authenticate succeed`);
				return authPayload;
			} else {
				// NOTE: 2.1 rf-token is in-valid
				this.logger.trace(`AUTH :: Refresh Authenticate failed`);
				throw new Error("INVALID_TOKEN");
			}
		} catch (error) {
			const type = "INVALID_TOKEN";
			this.logger.trace(`AUTH :: Error on refreshing auth -> ${error}`);
			throw new UnAuthorizedError(type);
		}
	}

	/**
	 * Extract authorization information from request/token
	 * auto refresh-auth info
	 * @param {*} req Request
	 * @param {string | null | undefined} token
	 * @param {boolean} required default is false
	 */
	async validateRequest(
		req = null,
		access_token = null,
		rf_token = null,
		required = false,
		options = null
	) {
		this.logger.trace(`AUTH :: Authenticate request`);
		const auth =
			access_token ||
			req.headers["Authorization"] ||
			req.headers["authorization"];
		const rfToken =
			rf_token ||
			req.headers["x-refresh-token"] ||
			req.headers["X-Refresh-Token"];

		if (auth && auth.startsWith("Bearer") && rfToken) {
			// NOTE: 1 Case Token
			const accessToken = auth.slice(7);
			let returned;

			try {
				const decrypted = jwt.verify(
					accessToken,
					PUBLIC_KEY,
					this.jwtOptions
				);

				if (decrypted && Object.keys(decrypted).length) {
					// NOTE: 1.1 Case Token is valid
					const authPayload = {
						user: {
							id: decrypted.id,
							fullname: decrypted.fullname,
						},
						accessToken: accessToken,
						refreshToken: rfToken,
					};
					this.logger.debug(
						`AUTH :: validate request ${decrypted.id} -> ${authPayload}`
					);
					returned = authPayload;
				} else {
					// NOTE: 1.2 Case Token is invalid
					throw new Error(AUTH_ERRORS.INVALID_TOKEN);
				}
			} catch (error) {
				this.logger.trace(`AUTH :: Authentication failed`);
				this.logger.error(
					`AUTH :: Error on decrypting token :: ${JSON.stringify(
						error
					)}`
				);
			} finally {
				if (returned) return returned;
				// NOTE: 2 Case death-Token & rf-token
				try {
					this.logger.trace(
						`AUTH :: Prepare to refresh authentication`
					);
					const rfDecrypted = jwt.verify(
						rfToken,
						SECRET,
						this.jwtRFOptions
					);
					const savedPayload = await this.cache.getToken(
						rfDecrypted.sub
					);
					const decrypted = jwt.decode(accessToken, this.jwtOptions);

					// NOTE: verify rf-token is valid
					if (
						accessToken === savedPayload.accessToken &&
						savedPayload &&
						decrypted &&
						decrypted.id === savedPayload.userId &&
						options.ip === savedPayload.ip &&
						options.userAgent === savedPayload.userAgent
					) {
						// NOTE: 2.1 rf-token is valid -> re-fresh auth
						// delete old RF-Token
						await this.cache.deleteToken(rfDecrypted.sub);
						const {
							accessToken,
							refreshToken,
						} = await this.generateToken(
							{
								id: decrypted.id,
								fullname: decrypted.fullname,
								username: decrypted.username,
							},
							options
						);

						const authPayload = {
							user: {
								id: decrypted.id,
								fullname: decrypted.fullname,
							},
							accessToken,
							refreshToken,
							authUpdated: true,
						};
						this.logger.trace(
							`AUTH :: Refresh Authenticate succeed`
						);
						return authPayload;
					} else {
						// NOTE: 2.1 rf-token is in-valid
						this.logger.trace(
							`AUTH :: Refresh Authenticate failed`
						);
						throw new MoleculerError(
							AUTH_ERRORS.INVALID_TOKEN,
							AUTH_ERRORS.code
						);
					}
				} catch (error) {
					this.logger.error(
						`AUTH :: Error on decrypted token :: ${error}`
					);
					throw new MoleculerError(
						AUTH_ERRORS.INVALID_TOKEN,
						AUTH_ERRORS.code
					);
				}
			}
		} else if (required) {
			// No token. Throw an error or do nothing if anonymous access is allowed.
			// throw new E.UnAuthorizedError(E.ERR_NO_TOKEN);
			this.logger.error(`AUTH :: Error on decrypted token :: empty data`);
			throw new MoleculerError(
				AUTH_ERRORS.INVALID_TOKEN,
				AUTH_ERRORS.code
			);
		} else {
			// Do nothing
			this.logger.debug(
				`AUTH :: validate request -> no auth -> no required`
			);
			return null;
		}
	}
}

module.exports = Authentication;
