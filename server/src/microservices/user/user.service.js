"use strict";
// import importants modules
const { MoleculerError } = require("moleculer").Errors;
const unflatten = require("flat").unflatten;
const _ = require("lodash");

const {
	AUTH_ERRORS,
	INPUT_ERRORS,
	CRUD_USER_ERRORS,
} = require("../../common/constants");
const AuthenticationHandler = require("../../handlers/auth-handler");
const {
	userDBOptions,
	generateModels,
	DatabaseContext,
} = require("./dbContext");

// these comment will give us tons of intellisense suggestion
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingMessage Incoming HTTP Request
 * @typedef {import('http').ClientRequest} ClientRequest HTTP Server Response
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

// service declaration/definition
module.exports = {
	name: process.env.SERVICE_USER_NAME, // service name
	version: process.env.SERVICE_USER_VERSION, // versioning
	metadata: {
		scalable: true,
		priority: 5,
	}, // the metadata
	settings: {
		// Base path
		rest: "user/",
	}, // setting
	actions: {
		// contains all endpoint declaration/definition and handler of each endpoint
		signin: {
			// endpoint definition
			rest: {
				method: "POST",
				fullPath: "/signin",
			},
			// endpoint parameter, moleculer auto merge URL query string and body parameter into one params object
			params: {
				username: { type: "string", min: 4, max: 255 },
				password: { type: "string", min: 6, max: 255 },
			},
			// handler of this action
			/**
			 * Authorize the user from request
			 *
			 * @param {Context} ctx
			 * @param {Object} params
			 * @param {Object} meta
			 * @returns
			 */
			async handler({ params, meta, ...ctx }) {
				const { username, password } = params; // destructuring params object
				const { ip, userAgent } = meta;

				// get all user by filters
				let user = await this.dbContext.models.User.findAll({
					where: {
						username: username,
					},
				});

				// check if user is exist or not
				if (user && user.length === 1) {
					user = user[0];
				} else {
					this.logger.error(`user.signin :: User not found`);
					throw new MoleculerError(
						AUTH_ERRORS.USER_NOT_FOUND,
						AUTH_ERRORS.code,
						"USER_NOT_FOUND"
					);
				}

				// password validation
				const valid = this.authHandler.verifyPassword(
					password,
					user.password
				);

				// check if password is verified or not
				if (!valid) {
					this.logger.error(`user.signin :: Invalid password`);
					throw new MoleculerError(
						AUTH_ERRORS.INVALID_USER_NAME_PASSWORD,
						AUTH_ERRORS.code,
						"INVALID_USER_NAME_PASSWORD"
					);
				}

				// hide some properies before responding
				const refinedUser = this.refinedUserObject(user.get());
				// generate token
				const {
					accessToken,
					refreshToken,
				} = await this.authHandler.generateToken(refinedUser, {
					ip,
					userAgent,
				});
				// compose payload before responding
				return { ...refinedUser, accessToken, refreshToken };
			},
		},
		signout: {
			rest: {
				method: "POST",
				fullPath: "/signout",
			},
			/**
			 * Authorize the user from request
			 *
			 * @param {Context} ctx
			 * @param {Object} params
			 * @param {Object} meta
			 * @returns
			 */
			async handler({ params, meta, ...ctx }) {
				return this.authHandler.deleteAuthInfo(meta.accessToken);
			},
		},
		signup: {
			rest: {
				method: "POST",
				fullPath: "/signup",
			},
			params: {
				username: { type: "string", min: 3, max: 255 },
				password: { type: "string", min: 6, max: 255 },
				confirmPassword: { type: "string", min: 6, max: 255 },
			},
			/**
			 * Authorize the user from request
			 *
			 * @param {Context} ctx
			 * @param {Object} params
			 * @param {Object} meta
			 * @returns
			 */
			async handler({ params, meta, ...ctx }) {
				const { username, password, confirmPassword } = params;
				const { ip, userAgent } = meta;

				let user = await this.dbContext.models.User.findAll({
					where: {
						username,
					},
				});

				if (user && user.length === 1) {
					// NOTE: CASE 1: user existed
					this.logger.info(`user.signup :: User existed`);
					throw new MoleculerError(
						AUTH_ERRORS.USER_EXISTED,
						AUTH_ERRORS.code,
						"USER_EXISTED"
					);
				}

				if (confirmPassword === password) {
					// NOTE: CASE 2.1: username is available and password is valid
					// create user
					const created = await this.dbContext.models.User.create({
						username: username,
						password: this.authHandler.hashPassword(password),
					});

					// hide sensitive information
					const refined = this.refinedUserObject(created.get());
					// generate access token
					const authPayload = await this.authHandler.generateToken(
						refined,
						{ ip, userAgent }
					);
					// compose payload and response to client
					return { ...refined, ...authPayload };
				} else {
					// NOTE: CASE 2.2: username is available but password is invalid, or other cases
					this.logger.error(
						`user.signup :: Password and Confirm Password do not match`
					);
					throw new MoleculerError(
						AUTH_ERRORS.INVALID_USER_NAME_PASSWORD,
						AUTH_ERRORS.code,
						"INVALID_USER_NAME_PASSWORD"
					);
				}
			},
		},
		// this action will not publish under any enpoind, only internal usage and stays behind the gateway
		verify: {
			// rest: {
			// 	method: "POST",
			// 	fullPath: "/verify",
			// },
			params: {
				accessToken: { type: "string" },
				rfToken: { type: "string" },
			},
			/**
			 * Authorize the user from request
			 *
			 * @param {Context} ctx
			 * @param {Object} params
			 * @param {Object} meta
			 * @returns
			 */
			async handler({ params, meta, ...ctx }) {
				const { ip, userAgent } = meta;

				// NOTE: extract sensitive info from token
				const authPayload = await this.authHandler.verifyAuth(
					ctx.options.parentCtx.params.req
				);

				return authPayload;
			},
		},
		getProfile: {
			rest: {
				method: "GET",
				fullPath: "/getProfile",
			},
			/**
			 * Authorize the user from request
			 *
			 * @param {Context} ctx
			 * @param {Object} params
			 * @param {Object} meta
			 * @returns
			 */
			async handler({ params, meta, ...ctx }) {
				const { userInfo: user } = meta;

				const results = await this.dbContext.models.User.findByPk(
					user.id
				);

				if (results) {
					const refined = this.refinedUserObject(results.get());
					return refined;
				} else {
					this.logger.info(`user.getProfile :: User not found`);
					throw new MoleculerError(
						AUTH_ERRORS.USER_NOT_FOUND,
						AUTH_ERRORS.code,
						"USER_NOT_FOUND"
					);
				}
			},
		},
		update: {
			rest: {
				method: "PUT",
				fullPath: "/updateProfile",
			},
			params: {
				fullname: {
					type: "string",
					min: 3,
					max: 255,
					nullable: true,
					optional: true,
				},
				old_password: {
					type: "string",
					min: 6,
					max: 255,
					optional: true,
				},
				new_password: {
					type: "string",
					min: 6,
					max: 255,
					optional: true,
				},
				re_new_password: {
					type: "string",
					min: 6,
					max: 255,
					optional: true,
				},
			},
			/**
			 * Authorize the user from request
			 *
			 * @param {Context} ctx
			 * @param {Object} params
			 * @param {Object} meta
			 * @returns
			 */
			async handler({ params, meta, ...ctx }) {
				const { userInfo: user } = meta;

				const {
					fullname,
					old_password,
					new_password,
					re_new_password,
				} = params;

				try {
					const _user = await this.dbContext.models.User.findByPk(
						user.id
					);
					if (!user || user.deleted) {
						throw new MoleculerError(
							AUTH_ERRORS.ACCESS_DENIED,
							AUTH_ERRORS.code,
							AUTH_ERRORS.ACCESS_DENIED
						);
					}

					if (fullname) {
						// NOTE: CASE update fullname
						_user.fullname = fullname;
					}
					if (new_password) {
						// NOTE: CASE update password
						// verify old password
						const isValid = this.authHandler.verifyPassword(
							old_password,
							_user.password
						);

						if (!isValid) {
							// user provided invalid old-password
							this.logger.error(
								`user.updateProfile :: Old password does not match`
							);
							throw new MoleculerError(
								INPUT_ERRORS.BAD_INPUT + ". Wrong password",
								INPUT_ERRORS.code,
								"BAD_INPUT"
							);
						}

						// user provided valid old-password
						if (new_password !== re_new_password) {
							// but new password is invalid
							this.logger.error(
								`user.updateProfile :: New Password and Confirm Password do not match`
							);
							throw new MoleculerError(
								INPUT_ERRORS.BAD_INPUT +
									". New password and Reconfirm password are not match",
								INPUT_ERRORS.code,
								"BAD_INPUT"
							);
						}

						// new password is valid -> update password
						const hashedPassword = this.authHandler.hashPassword(
							re_new_password
						);

						_user.password = hashedPassword;
					}

					// update to db
					await _user.save();
					// hide sensitive information
					const refined = this.refinedUserObject(_user.get());
					// responding
					return refined;
				} catch (error) {
					this.logger.error(
						`user.updateProfile :: Cannot update user profile ${error}`
					);
					throw new MoleculerError(
						CRUD_USER_ERRORS.ERR_UPDATE_USER,
						CRUD_USER_ERRORS.code,
						"ERR_UPDATE_USER"
					);
				}
			},
		},
	},
	// hooks of this service actions
	hooks: {
		before: {
			"*": "deflatMetadata",
		},
	},
	// triggered event declaration/definition
	events: {},
	// private functions/methods of this service
	methods: {
		refinedUserObject(user) {
			const refined = { ...user };

			delete refined.password;
			delete refined.deleted;
			delete refined.created_at;
			delete refined.updated_at;
			``;
			return refined;
		},
		/**
		 * Authorize the user from request
		 *
		 * @param {Context} ctx
		 * @returns
		 */
		deflatMetadata(ctx) {
			const newMetadata = unflatten(ctx.meta);
			ctx.meta = _.omitBy(newMetadata, _.isNil);
		},
	},
	async started() {
		// Auto-generate sequelize model
		try {
			// check if able to import init-function
			require("./models/init-models");
		} catch (e) {
			// if un-able to import init function -> run auto-generate
			if (e instanceof Error && e.code === "MODULE_NOT_FOUND") {
				try {
					await generateModels(userDBOptions, this.logger);
				} catch (error) {
					this.logger.error(`Error on created service -> ${error}`);
					this.broker.stop();
				}
			}
		}
		this.dbContext = new DatabaseContext(this.logger);
		this.authHandler = new AuthenticationHandler(
			this.dbContext,
			this.logger
		);
	},
};
