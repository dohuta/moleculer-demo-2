import { AxiosResponse } from "axios";

const Fetcher = require("./fetcherBase");
const User = require("../models/User");

const _API = process.env.USER_API || "http://localhost:3000/api/user";

class UserFetcher extends Fetcher {
  constructor() {
    super(_API);
  }

  async update(data: User) {
    const res = await this.axios.put("/update", data);
    return postProcess(res);
  }

  async getProfile() {
    const res = await this.axios.get("/getProfile");
    return postProcess(res);
  }
}

const postProcess = (response: AxiosResponse) => {
  console.log(
    "🚀 ~ file: UserFetcher.ts ~ line 22 ~ postProcess ~ response",
    response
  );
  if (response && response.status === 200) {
    const { id, fullname, username, createdAt, updatedAt } = response.data;

    return new User(id, fullname, username, createdAt, updatedAt);
  }
};

export default new UserFetcher();
