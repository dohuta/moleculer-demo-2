"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const UserSvc = require("../../../src/microservices/user/user.service");

const _SERVICE = `${process.env.SERVICE_USER_VERSION}.${process.env.SERVICE_USER_NAME}`;

describe("Test 'user' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(UserSvc);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe("Test 'user.signin' action", () => {
		it("should return auth payload with access token", async () => {
			const res = await broker.call(`${_SERVICE}.signin`, {
				username: "demo1",
				password: "@abc12345",
			});
			const ok_id = Object.hasOwnProperty.call(res, "id");
			const ok_username = Object.hasOwnProperty.call(res, "username");
			const ok_fullname = Object.hasOwnProperty.call(res, "fullname");
			const ok_accessToken = Object.hasOwnProperty.call(
				res,
				"accessToken"
			);
			expect(typeof res).toBe("object");
			expect(ok_id).toBeTruthy();
			expect(ok_username).toBeTruthy();
			expect(ok_fullname).toBeTruthy();
			expect(ok_accessToken).toBeTruthy();
			expect(typeof res.accessToken).toBe("string");
			expect(res.accessToken.length).toBeGreaterThan(0);
		});

		it("should throw error due to username too short", async () => {
			expect.assertions(1);
			try {
				await broker.call(`${_SERVICE}.signin`, {
					username: "dem",
					password: "@abc12345",
				});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});

		it("should throw error due to username too long", async () => {
			expect.assertions(1);
			try {
				await broker.call(`${_SERVICE}.signin`, {
					username:
						"KoyV29ij7kYRP6qWfCuDlKoUp8gjFVCYZ342YLXWUGZlJ0Dk9oIXKkko5UxhqnuAYS5vCw70W9RbtddDHVA5iM3j2HDWNcsZHRiExICZJUpzCRqltmAJplBn6uVM7P27WFtkcCkXOMI1TL0Vztngi80x8p8YjQQgaWLmSGKMxol4hMAx3ue6pxvq8pHouy7a6wOVQDzy91GkKGY6pSxlhsNn7gvnsGlv4gEbEklp8HHFDyNZ2fnWVDiXXagdvGpF",
					password: "@abc12345",
				});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});

		it("should throw error due to password too short", async () => {
			expect.assertions(1);
			try {
				await broker.call(`${_SERVICE}.signin`, {
					username: "demo1",
					password: "@abc1",
				});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});

		it("should throw error due to password too long", async () => {
			expect.assertions(1);
			try {
				await broker.call(`${_SERVICE}.signin`, {
					username: "demo1",
					password:
						"KoyV29ij7kYRP6qWfCuDlKoUp8gjFVCYZ342YLXWUGZlJ0Dk9oIXKkko5UxhqnuAYS5vCw70W9RbtddDHVA5iM3j2HDWNcsZHRiExICZJUpzCRqltmAJplBn6uVM7P27WFtkcCkXOMI1TL0Vztngi80x8p8YjQQgaWLmSGKMxol4hMAx3ue6pxvq8pHouy7a6wOVQDzy91GkKGY6pSxlhsNn7gvnsGlv4gEbEklp8HHFDyNZ2fnWVDiXXagdvGpF",
				});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});

		it("should throw error due to missing username", async () => {
			expect.assertions(1);
			try {
				await broker.call(`${_SERVICE}.signin`, {
					password: "@abc12345",
				});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});

		it("should throw error due to missing password", async () => {
			expect.assertions(1);
			try {
				await broker.call(`${_SERVICE}.signin`, {
					username: "demo1",
				});
			} catch (err) {
				expect(err).toBeInstanceOf(ValidationError);
			}
		});
	});
});
