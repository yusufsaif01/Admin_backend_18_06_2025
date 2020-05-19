const convict = require("convict");

const app = require("./configs/app");
const logger = require("./configs/logger");
const server = require("./configs/server");
const db = require("./configs/db");
const helper = require("./configs/helper");
const jwt = require("./configs/jwt");

// Define a schema
var config = convict({
	app,
	logger,
	db,
	server,
	helper,
	jwt
});

// Perform validation
config.validate({ allowed: "strict" });

module.exports = config._instance;
