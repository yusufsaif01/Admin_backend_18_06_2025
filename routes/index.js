const express = require('express');
const locationRoutes = require('./location.rest');
const memberRoutes = require('./member.rest');
const memberTypeRoutes = require('./member-type.rest');
const playerSpecializationRoutes = require('./player-specialization.rest');
const playerDocuments = require('./player-documents.rest');
const clubAcademyDocuments = require('./club-academy-documents.rest');
const employmentContract = require('./employment-contract.rest');
const userAuth = require('./userAuth')
const accessWhitelist = require('./access-whitelist.rest');
const checkAccessToken = require("../middleware/auth/access-token");
class Route {
	loadRoutes(app) {
		const apiRouter = express.Router();
		userAuth(apiRouter);
		locationRoutes(apiRouter);
		memberRoutes(apiRouter);
		memberTypeRoutes(apiRouter);
		playerSpecializationRoutes(apiRouter);
		playerDocuments(apiRouter);
		clubAcademyDocuments(apiRouter);
		employmentContract(apiRouter);
		accessWhitelist(apiRouter);

		app.use('/api/admin', checkAccessToken(), apiRouter);
		app.use("/apidocs", express.static("apidocs/doc"));
		app.use("/uploads", express.static("uploads"));
		
	}
}

module.exports = new Route();
