const convict = require("convict");
const azureMailer = require("./configs/azureMailer.json");
const app = require("./configs/app");
const logger = require("./configs/logger");
const server = require("./configs/server");
const db = require("./configs/db");
const helper = require("./configs/helper");
const jwt = require("./configs/jwt");
const redis = require("./configs/redis")
const mailer = require("./configs/mailer");

// Define a schema
var config = convict({
	app,
	logger,
	azureMailer,
	db,
	server,
	helper,
	redis,
	jwt,
	mailer
});

// Perform validation
config.validate({ allowed: "strict" });

module.exports = config._instance;
