const Fetcher = require("./fetcherBase");

const _API = process.env.USER_API || "http://localhost:3000/api/user";

class User extends Fetcher {
  constructor() {
    super(_API);
  }

  async update(data, token) {
    if (!token) {
      throw new Error("Missing token");
    }
    return this.axios.put("/update", data, {
      header: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getProfile(token) {
    if (!token) {
      throw new Error("Missing token");
    }
    return this.axios.get("/getProfile", {
      header: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

module.exports = new User();
