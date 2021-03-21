const mongoose = require("../mongoClient");
const Schema = mongoose.Schema;

const NoteModel = mongoose.model(
	"Note",
	new Schema({
		createdBy: {
			type: String,
			required: true
		},
		content: {
			type: String,
			required: true,
			trim: true,
		},
		deleted: Boolean,
		createdAt: { type: Date, default: Date.now },
		updatedAt: Date,
	})
);

module.exports = NoteModel;
