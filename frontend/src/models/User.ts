export default class User {
  id: string;
  fullname: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  /**
   *
   */
  constructor(
    id: string,
    fullname: string,
    username: string,
    createdAt: string | Date,
    updatedAt: string | Date
  ) {
    this.id = id;
    this.fullname = fullname;
    this.username = username;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  get() {
    return {
      id: this.id,
      fullname: this.fullname,
      username: this.username,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  update(fullname: string) {
    this.fullname = fullname;
  }

  async save() {}
}
