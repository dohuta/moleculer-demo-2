const SequelizeAuto = require("sequelize-auto");
const { Sequelize } = require("sequelize");

const DB_ERRORS = require("../../common/constants").DATABASE_CONNECTION_ERRORS;

const userDBOptions = {
	dialect: "mssql",
	host: process.env.SERVICE_USER_DB_HOST,
	port: process.env.SERVICE_USER_DB_PORT,
	database: process.env.SERVICE_USER_DB_NAME,
	username: process.env.SERVICE_USER_DB_USRNAME,
	password: process.env.SERVICE_USER_DB_PWD,
};

/**
 *
 * @param {Options} options
 */
const verifyDBOptions = (options) => {
	if (!options || Object.keys(options).length === 0)
		throw new Error(DB_ERRORS.MISSING_DB_DESC);
	if (!options.dialect) throw new Error(DB_ERRORS.MISSING_DIALEC);
	if (!options.database) throw new Error(DB_ERRORS.MISING_DB_NAME);
	if (!options.host) throw new Error(DB_ERRORS.MISSING_DB_HOST);
	if (!options.port) throw new Error(DB_ERRORS.MISSING_DB_PORT);
	if (!options.username) throw new Error(DB_ERRORS.MISSING_DB_USRNAME);
	if (!options.password) throw new Error(DB_ERRORS.MISSING_DB_USRPWD);
};

async function generateModels(options, logger) {
	return new Promise((resolve, reject) => {
		try {
			verifyDBOptions(options);
			const auto = new SequelizeAuto(
				options.database,
				options.username,
				options.password,
				{
					host: options.host,
					dialect: options.dialect,
					directory: `${__dirname}/models`, // where to write files
					port: options.port,
					// caseModel: "c", // convert snake_case column names to camelCase field names: user_id -> userId
					// caseFile: "c", // file names created for each model use camelCase.js not snake_case.js
					singularize: true, // convert plural table names to singular model names
					additional: {
						timestamps: false,
						// ...options added to each model
					},
					//...
				}
			);
			auto.run().then((data) => {
				// console.log(data.tables); // table and field list
				// console.log(data.foreignKeys); // table foreign key list
				// console.log(data.indexes); // table indexes
				// console.log(data.hasTriggerTables); // tables that have triggers
				// console.log(data.relations); // relationships between models
				// console.log(data.text); // text of generated models
				logger.info(
					`DBContext :: Model auto-generated -> ${data.text}`
				);
				resolve(data);
			});
		} catch (error) {
			reject(error);
		}
	});
}

class DatabaseContext {
	constructor(logger) {
		this.logger = logger;
		try {
			verifyDBOptions(userDBOptions);
			this.adapter = new Sequelize(userDBOptions);
			this.models = require("./models/init-models")(this.adapter);
			this.logger.info(`🚀 DBContext :: initialized`);
		} catch (error) {
			this.logger.error(
				`DBContext :: Error on context intializing :: ${error}`
			);
		}
	}
}

module.exports.userDBOptions = userDBOptions;
module.exports.verifyDBOptions = verifyDBOptions;
module.exports.generateModels = generateModels;
module.exports.DatabaseContext = DatabaseContext;
