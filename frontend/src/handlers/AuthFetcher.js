const Fetcher = require("./fetcherBase");

const _API = process.env.AUTH_API || "http://localhost:3000/api/auth";

class Auth extends Fetcher {
  constructor() {
    super(_API);
  }

  async signIn(username, password) {
    if (!username.trim() || !password) {
      throw new Error("Missing username or password");
    }
    return this.axios.post("/signin", { username, password });
  }

  async signUp(username, password, confirmPassword) {
    if (!username.trim() || !password || !confirmPassword) {
      throw new Error("Missing username or password or re-entered password");
    }
    return this.axios.post("/signup", { username, password, confirmPassword });
  }

  async signout(token) {
    if (!token) {
      throw new Error("Missing token");
    }
    return this.axios.post("/signout", undefined, {
      header: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

module.exports = new Auth();
