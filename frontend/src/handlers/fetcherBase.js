const axios = require("axios").default;

class Fetcher {
  constructor(api) {
    this.axios = axios.create({
      baseURL: api,
      headers: {
        'Content-Type': 'application/json',
        "Cache-Control": "no-cache",
      },
    });
  }

  get(endpoint, config = undefined) {
    return this.axios.get(endpoint, config);
  }

  post(endpoint, data, config = undefined) {
    return this.axios.post(endpoint, data, config);
  }

  put(endpoint, data, config = undefined) {
    return this.axios.put(endpoint, data, config);
  }

  patch(endpoint, data, config = undefined) {
    return this.axios.patch(endpoint, data, config);
  }

  delete(endpoint, config = undefined) {
    return this.axios.delete(endpoint, config);
  }
}

module.exports = Fetcher;
