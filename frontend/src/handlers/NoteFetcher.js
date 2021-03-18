const Fetcher = require("./fetcherBase");

const _API = process.env.USER_API || "http://localhost:3000/api/note";

class Note extends Fetcher {
  constructor() {
    super(_API);
  }

  async getOne(id, token) {
    if (!id) {
      throw new Error("Missing id");
    }
    if (!token) {
      throw new Error("Missing token");
    }
    return this.axios.get(`/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  async getMany(query, token) {
    if (!token) {
      throw new Error("Missing token");
    }
    return this.axios.get("", query, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async create(data, token) {
    if (!token) {
      throw new Error("Missing token");
    }
    return this.axios.post("", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async update(id, data, token) {
    if (!id) {
      throw new Error("Missing id");
    }
    if (!token) {
      throw new Error("Missing token");
    }
    return this.axios.patch(`/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async replace(id, data, token) {
    if (!id) {
      throw new Error("Missing id");
    }
    if (!token) {
      throw new Error("Missing token");
    }
    return this.axios.put(`/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async delete(id, token) {
    if (!id) {
      throw new Error("Missing id");
    }
    if (!token) {
      throw new Error("Missing token");
    }
    return this.axios.delete(`/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

module.exports = new Note();
