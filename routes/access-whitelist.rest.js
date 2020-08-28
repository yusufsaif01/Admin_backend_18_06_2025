const accessWhitelistValidator = require("../middleware/validators/accessWhitelistValidator");
const { checkAuthToken, checkRole } = require("../middleware/auth");
const ROLE = require("../constants/Role");
const AccessWhitelistService = require("../services/AccessWhitelistService");
const ResponseHandler = require("../ResponseHandler");

const accessWhiteListInst = new AccessWhitelistService();

module.exports = (router) => {
  // admin management
  router.get(
    "/access-whitelist",
    checkAuthToken,
    checkRole(ROLE.ADMIN),
    (req, res) => {
      const query = {
        pageSize: req.query.pageSize || 10,
        page: req.query.pageSize || 1,
      };

      ResponseHandler(req, res, accessWhiteListInst.getList(query));
    }
  );
  router.post(
    "/access-whitelist",
    checkAuthToken,
    checkRole(ROLE.ADMIN),
    accessWhitelistValidator.post,
    (req, res) => {
      ResponseHandler(req, res, accessWhiteListInst.whiteListUser(req.body));
    }
  );
  router.put(
    "/access-whitelist/:id",
    checkAuthToken,
    checkRole(ROLE.ADMIN),
    accessWhitelistValidator.post,
    (req, res) => {
      ResponseHandler(
        req,
        res,
        accessWhiteListInst.updateOne(req.params.id, req.body)
      );
    }
  );
  router.delete(
    "/access-whitelist/:id",
    checkAuthToken,
    checkRole(ROLE.ADMIN),
    (req, res) => {
      ResponseHandler(req, res, accessWhiteListInst.delete(req.params.id));
    }
  );
};
