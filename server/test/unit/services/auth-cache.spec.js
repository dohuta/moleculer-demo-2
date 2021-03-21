const authCache = new (require("../../../src/services/auth-cache"))();
const cache = new (require("../../../src/services/cache"))(1);

describe("Test auth-cacher", () => {
	beforeAll(() => cache.flush());
	afterAll(() => cache.flush());
	beforeEach(() => cache.flush());

	it("should get token from cache", async () => {
		await cache.set("test", { a: "hello", b: true });

		const res = await authCache.getToken("test");

		expect(typeof res).toBe("object");
		expect(res.a).toBe("hello");
		expect(res.b).toBeTruthy();
	});

	it("should set token to cache", async () => {
		const res = await authCache.setToken("hello", { hello: true });
		expect(res).toBeTruthy();

		const crossCheck = await cache.get("hello");
		const ok = Object.hasOwnProperty.call(crossCheck, "hello");

		expect(typeof crossCheck).toBe("object");
		expect(ok).toBeTruthy();
		expect(crossCheck.hello).toBeTruthy();
	});

	it("should delete token from cache", async () => {
		await cache.set("test", { a: "hello", b: true });

		const res = await authCache.deleteToken("test");

		const crossCheck = await cache.get("test");
		expect(res).toBeTruthy();
		expect(crossCheck).toBeUndefined;
	});
});
