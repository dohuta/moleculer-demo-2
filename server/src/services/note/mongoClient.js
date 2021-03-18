const mongoose = require("mongoose");

const username = encodeURIComponent(process.env.SERVICE_NOTE_DB_USRNAME);
const password = encodeURIComponent(process.env.SERVICE_NOTE_DB_PWD);
const database = encodeURIComponent(process.env.SERVICE_NOTE_DB_NAME);
const clusterUrl = `${process.env.SERVICE_NOTE_DB_HOST}:${process.env.SERVICE_NOTE_DB_PORT}`;

// Connection URI
const uri = `mongodb://${username}:${password}@${clusterUrl}/${database}`;

mongoose.Promise = global.Promise;

mongoose.connection.on(
	"error",
	console.error.bind(console, "MongoDB connection error:")
);

mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

module.exports = mongoose;
