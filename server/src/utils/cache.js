const Redis = require("ioredis");
const ms = require("ms");

class CacheBase {
	constructor(databaseName) {
		const db = new Redis(
			`redis://:${process.env.REDIS_PWD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
			{
				db: databaseName || 0,
				showFriendlyErrorStack: true,
			}
		);

		this.databaseName = databaseName || 0;
		this.cache = db;
		console.info(`Cache db ${this.databaseName} is initialized`);
	}

	/**
	 * Get value by key
	 * @param {String} key
	 */
	async get(key) {
		const rawData = await this.cache.get(key);
		console.info(`Cache::${this.databaseName} get ${key} value ${rawData}`);
		return JSON.parse(rawData);
	}

	/**
	 * Get many value by prefix key
	 * @param {String | undefined | null} prefix (empty if get all)
	 */
	async getMany(prefix = undefined) {
		const rawData = await this.cache.keys(`${prefix ? prefix : ""}*`);
		const data = rawData.map(async (key) => {
			const temp = {};
			const value = await this.cache.get(key);
			temp[key] = JSON.parse(value);
			return temp;
		});
		console.info(
			`Cache::${this.databaseName} getMany ${prefix} value ${rawData}`
		);
		return data;
	}

	/**
	 * Get many keys by prefix
	 * @param {String | undefined | null} prefix (empty if get all)
	 */
	async getKeys(prefix = undefined) {
		const keys = await this.cache.keys(`${prefix ? prefix : ""}*`);
		console.info(`Cache::${this.databaseName} getKeys ${keys}`);
		return keys;
	}

	/**
	 * Set value by key
	 * @param {String} key
	 * @param {*} value
	 */
	async set(key, value) {
		const ok = await this.cache.set(key, JSON.stringify(value));
		console.info(
			`Cache::${this.databaseName} set ${key} value ${rawData} ok ${ok}`
		);
		return ok === "OK";
	}

	/**
	 * Set value by key with expiration
	 * @param {String} key
	 * @param {*} value
	 * @param {String} expiresIn ex: 3s, 1d, 12m...
	 */
	async setX(key, value, expiresIn) {
		const ok = await this.cache.set(
			key,
			JSON.stringify(value),
			"EX",
			ms(expiresIn) / 1000 // convert to second
		);
		console.info(
			`Cache::${this.databaseName} set ${key} value ${value} expires in ${expiresIn} ok ${ok}`
		);
		return ok === "OK";
	}

	/**
	 * Delete record by key
	 * @param {String} key
	 */
	async del(key) {
		const deleted = await this.cache.del(key);
		console.info(
			`Cache::${this.databaseName} delete ${key} deleted ${deleted}`
		);
		return deleted !== 0;
	}

	/**
	 * Delete many records by array of keys
	 * @param {String} keys
	 */
	async delMany(keys) {
		const deleted = await this.cache.del(keys);
		console.info(
			`Cache::${this.databaseName} delete ${keys} deleted ${deleted}`
		);
		return deleted !== 0;
	}

	/**
	 * Flush all
	 */
	async flush() {
		const ok = await this.cache.flushdb();
		console.info(`Cache::${this.databaseName} flush database ${ok}`);
		return ok === "OK";
	}
}

module.exports = CacheBase;
