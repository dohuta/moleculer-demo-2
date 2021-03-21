const jwt = require("jsonwebtoken");
const CacheBase = require("./cache");

class AuthCache {
	constructor(logger) {
		this.logger = logger || console;
		this.cache = new CacheBase(1, this.logger);
		this.logger.info(`🚀 AUTH_CACHE :: Initialized`);
	}

	/**
	 * Load payload from cache by token
	 * @param {String} token
	 * @returns {Promise<*>}
	 */
	async getToken(token) {
		const result = await this.cache.get(token);
		return result;
	}

	/**
	 * Save token as key and payload as value to cache
	 * @param {String} token
	 * @param {*} payload additional data
	 * @returns {Promise<Boolean>}
	 */
	async setToken(token, payload) {
		// NOTE: the line below doesnt set lifetime for token (each key-value pair in one hashset) so I replace with the second one, we will save an object of only ip
		await this.cache.setX(
			token,
			payload,
			process.env.JWT_EXPIRATION || "7d"
		);
		return true;
	}

	/**
	 * Save token as key and payload as value to cache
	 * @param {String} token
	 * @param {*} payload additional data
	 * @returns {Promise<Boolean>}
	 */
	async setRFToken(token, payload) {
		// NOTE: the line below doesnt set lifetime for token (each key-value pair in one hashset) so I replace with the second one, we will save an object of only ip
		await this.cache.setX(
			token,
			payload,
			process.env.JWT_RF_EXPIRATION || "30d"
		);
		return true;
	}

	/**
	 * Remove one token from cache
	 * @param {String} token
	 * @returns {Promise<Boolean>}
	 */
	async deleteToken(token) {
		return this.cache.del(token);
	}

	/**
	 * Delete all tokens from cache
	 * @param {String} userId
	 * @param {jwt} jwt
	 * @returns {Promise<Boolean>}
	 */
	async deleteAllTokensByUserId(userId) {
		const tokens = await this.cache.getKeys();
		tokens.forEach(async (token) => {
			const payload = jwt.decode(token);
			if (payload.user.id === userId) {
				await this.cache.del(token);
			}
		});
		return true;
	}
}

module.exports = AuthCache;
