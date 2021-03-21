import Fetcher from "./fetcherBase";

const AUTH_API_V1 = process.env.AUTH_API_V1 || "v1/auth";

class AuthFetcher extends Fetcher {
  constructor(config?: any) {
    super(config);
  }

  async signIn(username: string, password: string) {
    if (!username.trim() || !password) {
      throw new Error("Missing username or password");
    }
    return this.axios.post(AUTH_API_V1 + "/signin", { username, password });
  }

  async signUp(username: string, password: string, confirmPassword: string) {
    if (!username.trim() || !password || !confirmPassword) {
      throw new Error("Missing username or password or re-entered password");
    }
    return this.axios.post(AUTH_API_V1 + "/signup", {
      username,
      password,
      confirmPassword,
    });
  }

  async signout(all?: boolean) {
    return this.axios.post(AUTH_API_V1 + "/signout", { all });
  }
}

export default new AuthFetcher();
