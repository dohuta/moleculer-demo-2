"use strict";

const ApiGateway = require("moleculer-web");
const helmet = require("helmet");
const flatten = require("flat");
const requestIp = require("request-ip");

const AUTH_ERRORS = require("../../common/constants").AUTH_ERRORS;
const client = require("../note/mongoClient");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingMessage Incoming HTTP Request
 * @typedef {import('http').ClientRequest} ClientRequest HTTP Server Response
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

module.exports = {
	name: "GATEWAY",
	mixins: [ApiGateway],
	settings: {
		// Exposed port
		port: process.env.PORT || 3000,
		// Exposed IP
		ip: "0.0.0.0",
		use: [],
		cors: {
			origin: "*",
			methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
			allowedHeaders: "*",
			credentials: false,
		},
		routes: [
			{
				path: "/api",
				whitelist: [/(.*)signin/, /(.*)signup/, /(.*)refresh/],
				use: [helmet()],
				mergeParams: true,
				authentication: false,
				autoAliases: false,
				aliases: {
					health: "$node.health",
					"POST /auth/signin": `${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}.signin`,
					"POST /auth/signup": `${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}.signup`,
					"POST /auth/refresh": `${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}.refresh`,
				},
				onBeforeCall(ctx, route, req, res) {
					// Set request headers to context meta
					ctx.meta.ip = requestIp.getClientIp(req);
					ctx.meta.userAgent = req.headers["user-agent"];
				},
				// onAfterCall(ctx, route, req, res, data) {
				// 	// Async function which return with Promise
				// 	// return doSomething(ctx, res, data);
				// 	return;
				// },
				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB",
					},
					urlencoded: {
						extended: true,
						limit: "1MB",
					},
				},
				mappingPolicy: "all", // Available values: "all", "restrict"
				logging: true,
			},
			{
				path: "/api",
				whitelist: [
					`${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}.signout`,
					`${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}.update`,
					`${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}.getProfile`,
					`${process.env.SERVICE_NOTE_VERSION}.${process.env.SERVICE_NOTE_NAME}.*`,
				],
				use: [helmet()],
				mergeParams: true,
				authentication: true,
				autoAliases: false,
				aliases: {
					"REST note": `${process.env.SERVICE_NOTE_VERSION}.${process.env.SERVICE_NOTE_NAME}`,
					"POST /auth/signout": `${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}.signout`,
					"PUT /user/update": `${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}.update`,
					"GET /user/getProfile": `${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}.getProfile`,
				},
				onBeforeCall(ctx, route, req, res) {
					// Set request headers to context meta
					ctx.meta.ip = requestIp.getClientIp(req);
					ctx.meta.userAgent = req.headers["user-agent"];
				},
				// onAfterCall(ctx, route, req, res, data) {
				// 	// Async function which return with Promise
				// 	// return doSomething(ctx, res, data);
				// 	return;
				// },
				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB",
					},
					urlencoded: {
						extended: true,
						limit: "1MB",
					},
				},
				mappingPolicy: "all", // Available values: "all", "restrict"
				logging: true,
			},
		],
		log4XXResponses: "info",
		logRequestParams: "info",
		logResponseData: "info",
		assets: {
			folder: "../public",
			options: {},
		},
	},
	methods: {
		/**
		 * Authorize the user from request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingMessage} req
		 * @param {ServerResponse} res
		 * @returns
		 */
		authenticate(ctx, route, req, res) {
			let accessToken, rfToken;

			if (req.headers.authorization) {
				accessToken = req.headers.authorization;
			}
			if (
				req.headers["x-refresh-token"] ||
				req.headers["X-Refresh-Token"]
			) {
				rfToken =
					req.headers["x-refresh-token"] ||
					req.headers["X-Refresh-Token"];
			}

			if (!accessToken || !rfToken) {
				return Promise.reject(
					new ApiGateway.Errors.UnAuthorizedError("AUTH_FAILED")
				);
			}

			// Verify JWT token
			return ctx
				.call(
					`${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}.verify`,
					{
						accessToken,
						rfToken,
					}
				)
				.then(({ id, fullname, username }) => {
					if (!id && !username) {
						this.logger.error("User not found");
						return Promise.reject(
							new ApiGateway.Errors.UnAuthorizedError(
								"AUTH_FAILED"
							)
						);
					} else {
						const refined = flatten({
							userInfo: { id, fullname, username },
						});
						ctx.meta = {
							...ctx.meta,
							...refined,
							// accessToken,
							// rfToken,
							// authUpdated,
						};
						// if (authUpdated) {
						// 	res.setHeader("authorization", accessToken);
						// 	res.setHeader("X-Refresh-Token", refreshToken);
						// 	// res.setHeader("X-Auth-Updated", true);
						// }
					}
				})
				.catch((error) => {
					this.logger.error(
						`Authentication :: Error on authentication -> ${error}`
					);
					return Promise.reject(
						new ApiGateway.Errors.UnAuthorizedError("AUTH_FAILED")
					);
				});
		},
	},
};
