"use strict";

const ApiGateway = require("moleculer-web");
const helmet = require("helmet");
const flatten = require("flat");

const AUTH_ERRORS = require("../../common/constants").AUTH_ERRORS;
const client = require("../note/mongoClient");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

module.exports = {
	name: "api",
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
				whitelist: [/(.*)signin/, /(.*)signup/],
				use: [helmet()],
				mergeParams: true,
				authentication: false,
				autoAliases: true,
				aliases: {
					health: "$node.health",
					"POST /auth/signin": `${process.env.SERVICE_USER_VERSION}.user.signin`,
					"POST /auth/signup": `${process.env.SERVICE_USER_VERSION}.user.signup`,
				},
				onBeforeCall(ctx, route, req, res) {
					// Set request headers to context meta
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
					`${process.env.SERVICE_USER_VERSION}.user.signout`,
					`${process.env.SERVICE_USER_VERSION}.user.update`,
					`${process.env.SERVICE_USER_VERSION}.user.getProfile`,
					`${process.env.SERVICE_NOTE_VERSION}.note.*`,
				],
				use: [helmet()],
				mergeParams: true,
				authentication: true,
				autoAliases: false,
				aliases: {
					"REST note": `${process.env.SERVICE_NOTE_VERSION}.note`,
					"POST /auth/signout": `${process.env.SERVICE_USER_VERSION}.user.signout`,
					"PUT /user/update": `${process.env.SERVICE_USER_VERSION}.user.update`,
					"GET /user/getProfile": `${process.env.SERVICE_USER_VERSION}.user.getProfile`,
				},
				onBeforeCall(ctx, route, req, res) {
					// Set request headers to context meta
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
			let token;
			if (req.headers.authorization) {
				token = req.headers.authorization;
			}

			if (!token) {
				return Promise.reject(
					new ApiGateway.Errors.UnAuthorizedError(
						AUTH_ERRORS.ACCESS_DENIED
					)
				);
			}

			// Verify JWT token
			return ctx
				.call(`${process.env.SERVICE_USER_VERSION}.user.verify`, {
					token,
				})
				.then(({ user, accessToken }) => {
					if (!user) {
						return Promise.reject(
							new ApiGateway.Errors.UnAuthorizedError(
								AUTH_ERRORS.ACCESS_DENIED
							)
						);
					} else {
						const refined = flatten({ userInfo: { ...user } });
						ctx.meta = {
							...ctx.meta,
							...refined,
							accessToken,
						};
					}
				});
		},
	},
};
