const accessWhitelistValidator = require("../middleware/validators/accessWhitelistValidator");
const { checkAuthToken, checkRole } = require("../middleware/auth");
const ROLE = require("../constants/Role");
const AccessWhitelistService = require("../services/AccessWhitelistService");
const ResponseHandler = require("../ResponseHandler");
const AuthService = require('../services/AuthService');
const accessWhiteListInst = new AccessWhitelistService();

const responseHandler = require('../ResponseHandler');



module.exports = (router) => {

  router.post('/login', function (req, res) {
		console.log("loggeddddd");
		const authServiceInst = new AuthService();
		responseHandler(req, res, authServiceInst.login(req.body.email, req.body.password));
	});
};
