"use strict";
const { MoleculerError } = require("moleculer").Errors;
const unflatten = require("flat").unflatten;
const _ = require("lodash");

const { CRUD_NOTE_ERRORS } = require("../../common/constants");

const noteHandler = require("./handler");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

module.exports = {
	name: "note",
	version: process.env.SERVICE_NOTE_VERSION,
	metadata: {
		scalable: true,
		priority: 5,
	},
	settings: {
		// Base path
		rest: "note/",
	},
	actions: {
		list: {
			params: {
				id: { type: "string", optional: true },
				id_in: {
					type: "array",
					items: "string",
					empty: false,
					optional: true,
				},
				deleted: { type: "boolean", optional: true },
			},
			async handler({ action, params, meta, ...ctx }) {
				try {
					const { userInfo: user } = meta;
					const { id, id_in, deleted } = params;

					const result = await noteHandler.getManyNote({
						id,
						id_in,
						deleted,
						createdBy: user.id,
					});

					return result;
				} catch (error) {
					this.logger.error(
						`note.list :: Error on listing notes of ${meta.userInfo.id} :: ${error}`
					);
					throw new MoleculerError(
						CRUD_NOTE_ERRORS.ERR_LISTING_NOTE,
						CRUD_NOTE_ERRORS.code
					);
				}
			},
		},
		get: {
			params: {
				id: { type: "string" },
			},
			async handler({ action, params, meta, ...ctx }) {
				try {
					const { userInfo: user } = meta;
					const { id } = params;

					const result = await noteHandler.getOneNote({
						id,
						deleted: false,
						createdBy: user.id,
					});

					return result;
				} catch (error) {
					this.logger.error(
						`note.get :: Error on getting notes ${params.id} of ${meta.userInfo.id} :: ${error}`
					);
					throw new MoleculerError(
						CRUD_NOTE_ERRORS.ERR_LISTING_NOTE,
						CRUD_NOTE_ERRORS.code
					);
				}
			},
		},
		create: {
			params: {
				content: { type: "string" },
			},
			async handler({ action, params, meta, ...ctx }) {
				try {
					const { userInfo: user } = meta;
					const { content } = params;

					const newNote = new dbContext.model("Note");

					newNote.content = content;
					newNote.createdBy = user.id;

					await newNote.save();

					return newNote;
				} catch (error) {
					this.logger.error(
						`note.create :: Error on create note of ${meta.userInfo.id} :: ${error}`
					);
					throw new MoleculerError(
						CRUD_NOTE_ERRORS.ERR_LISTING_NOTE,
						CRUD_NOTE_ERRORS.code
					);
				}
			},
		},
		update: {
			params: {
				id: { type: "string" },
				content: { type: "string" },
				createdBy: { type: "string", optional: true },
			},
			async handler({ action, params, meta, ...ctx }) {
				try {
					const { userInfo: user } = meta;
					const { id, content, createdBy } = params;

					let note = await noteHandler.getOneNote({
						id,
						deleted: false,
						createdBy: user.id,
					});
					if (!note || !note.length) {
						throw new Error("Không tìm thấy");
					} else {
						note = note.pop();
					}

					note.content = content;
					if (createdBy) {
						note.createdBy = createdBy;
					}

					await note.save();

					return note;
				} catch (error) {
					this.logger.error(
						`note.update :: Error on update note of ${meta.userInfo.id} :: ${error}`
					);
					throw new MoleculerError(
						`${CRUD_NOTE_ERRORS.ERR_UPDATING_NOTE} :: ${error.message}`,
						CRUD_NOTE_ERRORS.code
					);
				}
			},
		},
		patch: {
			params: {
				id: { type: "string" },
				content: { type: "string" },
			},
			async handler({ action, params, meta, ...ctx }) {
				try {
					const { userInfo: user } = meta;
					const { id, content, createdBy } = params;

					let note = await noteHandler.getOneNote({
						id,
						deleted: false,
						createdBy: user.id,
					});
					if (!note || !note.length) {
						throw new Error("Không tìm thấy");
					} else {
						note = note.pop();
					}

					note.content = content;
					note.createdBy = createdBy;

					await note.save();

					return note;
				} catch (error) {
					this.logger.error(
						`note.patch :: Error on update note of ${meta.userInfo.id} :: ${error}`
					);
					throw new MoleculerError(
						`${CRUD_NOTE_ERRORS.ERR_UPDATING_NOTE} :: ${error.message}`,
						CRUD_NOTE_ERRORS.code
					);
				}
			},
		},
		remove: {
			params: {
				id: { type: "string" },
			},
			async handler({ action, params, meta, ...ctx }) {
				try {
					const { userInfo: user } = meta;
					const { id } = params;

					let note = await noteHandler.getOneNote({ id });
					if (!note || !note.length) {
						throw new Error("Không tìm thấy");
					} else {
						note = note.pop();
					}

					note.deleted = true;
					await note.save();

					return note;
				} catch (error) {
					this.logger.error(
						`note.list :: Error on listing notes of ${meta.userInfo.id} :: ${error}`
					);
					throw new MoleculerError(
						`${CRUD_NOTE_ERRORS.ERR_UPDATING_NOTE} :: ${error.message}`,
						CRUD_NOTE_ERRORS.code
					);
				}
			},
		},
	},
	hooks: {
		before: {
			"*": "deflatMetadata",
		},
	},
	events: {},
	methods: {
		deflatMetadata(ctx) {
			const newMetadata = unflatten(ctx.meta);
			ctx.meta = _.omitBy(newMetadata, _.isNil);
		},
	},
};
