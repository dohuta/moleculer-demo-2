const BaseLogger = require("moleculer").Loggers.Base;

class MyLogger extends BaseLogger {
	getLogHandler(bindings) {
		return (type, args) =>
			console[type](`[MYLOG-${bindings.mod}]`, ...args);
	}
}

module.exports = new MyLogger();
