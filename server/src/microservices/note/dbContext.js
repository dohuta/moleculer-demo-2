const _ = require("lodash");
const ObjectId = require("mongoose").Types.ObjectId;
const mongoose = require("mongoose");

const NoteModel = require("./models/note.model");

const _USER_NAME = encodeURIComponent(process.env.SERVICE_NOTE_DB_USRNAME);
const _PWD = encodeURIComponent(process.env.SERVICE_NOTE_DB_PWD);
const _DBNAME = encodeURIComponent(process.env.SERVICE_NOTE_DB_NAME);
const _HOST = `${process.env.SERVICE_NOTE_DB_HOST}:${process.env.SERVICE_NOTE_DB_PORT}`;

// Connection URI
const uri = `mongodb://${_USER_NAME}:${_PWD}@${_HOST}/${_DBNAME}`;

class DatabaseContext {
	constructor(logger) {
		this.logger = logger || console;

		try {
			mongoose.Promise = global.Promise;
			mongoose.connection.on(
				"error",
				logger.error.bind(console, "MongoDB connection error:")
			);
			mongoose.connect(uri, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
			this.logger.info(`🚀 DBContext :: initialized`);
		} catch (error) {
			throw error;
		}
	}

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

module.exports = DatabaseContext;
