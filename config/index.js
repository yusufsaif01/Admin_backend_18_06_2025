const convict = require("convict");

const app = require("./configs/app");
const logger = require("./configs/logger");
const server = require("./configs/server");
const db = require("./configs/db");
const helper = require("./configs/helper");
const jwt = require("./configs/jwt");
const redis = require("./configs/redis")

// Define a schema
var config = convict({
	app,
	logger,
	db,
	server,
	helper,
	redis,
	jwt
});

// Perform validation
config.validate({ allowed: "strict" });

module.exports = config._instance;
