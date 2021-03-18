const _ = require("lodash");
const ObjectId = require("mongoose").Types.ObjectId;

const NoteModel = require("./models/note.model");

class NoteHandler {
	constructor() {}

	async getOneNote(options) {
		if (!options || !Object.keys(options).length) {
			throw new Error("getOneNote :: Missing argument");
		}
		const id = options["id"];
		const queryObj = {
			_id: ObjectId(id),
		};
		const createdBy = options["createdBy"];
		if (createdBy) {
			queryObj.createdBy = createdBy;
		}

		const result = await NoteModel.find(queryObj);

		return result;
	}

	async getManyNote(options) {
		if (!options || !Object.keys(options).length) {
			throw new Error("getOneNote :: Missing argument");
		}
		let queryObj = {};

		const idIn = options["id_in"];
		if (idIn && idIn.length) {
			queryObj._id = { $in: idIn.map((x) => ObjectId(x)) };
			delete options["id_in"];
		}

		queryObj = _.omitBy(
			{ ...queryObj, ...options },
			(v) => _.isUndefined(v) || _.isNull(v) || v === ""
		);

		const result = await NoteModel.find(queryObj);

		return result;
	}
}

module.exports = new NoteHandler();
