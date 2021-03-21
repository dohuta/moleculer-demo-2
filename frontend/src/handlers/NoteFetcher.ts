import { AxiosResponse } from "axios";

import Fetcher from "./fetcherBase";
import Note from "../models/Note";

const NOTE_API_V1 = process.env.NOTE_API_V1 || "/v1/note";

class NoteFetcher extends Fetcher {
  constructor(config?: any) {
    super(config);
  }

  async getOne(id: string) {
    if (!id) {
      throw new Error("Missing id");
    }
    const res = await this.axios.get(NOTE_API_V1 + `/${id}`);
    return postProcess(res);
  }

  async getMany(filter?: any) {
    let queryStr = "";
    if (filter && Object.keys(filter).length) {
      if (filter["id"]) {
        queryStr += `${queryStr ? "&" : "?"}id=${filter["id"]}`;
      }
      if (filter["id_id"]) {
        for (const id of filter["id_id"]) {
          queryStr += `${queryStr ? "&" : "?"}id_in=${id}`;
        }
      }
      if (filter["deleted"] && typeof filter["deleted"] === "boolean") {
        queryStr += `${queryStr ? "&" : "?"}deleted=${filter["deleted"]}`;
      }
      if (filter["all"] && typeof filter["all"] === "boolean") {
        queryStr += `${queryStr ? "&" : "?"}all=${filter["all"]}`;
      }
    }
    const res = await this.axios.get(NOTE_API_V1 + "/" + queryStr);
    return postProcess(res);
  }

  async create(data: any) {
    const res = await this.axios.post(NOTE_API_V1, data);
    return postProcess(res);
  }

  async update(id: string, data: any) {
    if (!id) {
      throw new Error("Missing id");
    }
    const res = await this.axios.patch(NOTE_API_V1 + `/${id}`, data);
    return postProcess(res);
  }

  async replace(id: string, data: any) {
    if (!id) {
      throw new Error("Missing id");
    }
    const res = await this.axios.put(NOTE_API_V1 + `/${id}`, data);
    return postProcess(res);
  }

  async delete(id: string) {
    const res = await this.axios.delete(NOTE_API_V1 + `/${id}`);
    return postProcess(res);
  }
}

const postProcess = (response: AxiosResponse) => {
  console.log(
    "🚀 ~ file: NoteFetcher.ts ~ line 72 ~ postProcess ~ response",
    response
  );
  if (response && response.status === 200) {
    const {
      _id,
      createdBy,
      content,
      deleted,
      createdAt,
      updatedAt,
    } = response.data;

    return new Note(_id, createdBy, content, deleted, createdAt, updatedAt);
  }
};

export default new NoteFetcher();
