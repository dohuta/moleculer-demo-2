import Fetcher from "../handlers/fetcherBase";

const _API = process.env.USER_API || "http://localhost:3000/api/note";

export default class Note {
  _id?: string;
  createdBy?: string;
  content?: string;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  /**
   *
   */
  constructor(
    _id?: string,
    createdBy?: string,
    content?: string,
    deleted?: boolean,
    createdAt?: string,
    updatedAt?: string
  ) {
    this._id = _id;
    this.createdBy = createdBy;
    this.content = content;
    this.deleted = deleted;
    this.createdAt = createdAt ? new Date(createdAt) : undefined;
    this.updatedAt = updatedAt ? new Date(updatedAt) : undefined;
  }

  get() {
    return {
      _id: this._id,
      createdBy: this.createdBy,
      content: this.content,
      deleted: this.deleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  setContent(content: string) {
    this.content = content;
  }

  async save() {}

  async delete(deleted: boolean) {
    this.deleted = deleted;
  }

  static fetchAll() {
    const fetcher = new Fetcher(_API);
    fetcher.axios.request({});
  }
}
