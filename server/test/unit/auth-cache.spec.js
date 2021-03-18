const authCache = require("../../src/utils/auth-cache");
const cache = new (require("../../src/utils/cache"))(1);

describe("Test auth-cacher", () => {
	beforeAll(() => authCache.cache.flush());
	afterAll(() => authCache.cache.flush());
	beforeEach(() => authCache.cache.flush());

	it("should set token to cache", async () => {
		const res = await authCache.setToken("hello", { hello: true });
		expect(res).toBeTruthy();

		const crossCheck = await cache.get("hello");
		const ok = Object.hasOwnProperty.call(crossCheck, "hello");
		expect(typeof crossCheck).toBe("object");
		expect(ok).toBeTruthy();
		expect(crossCheck.hello).toBeTruthy();
	});
});
