const accessWhitelistValidator = require("../middleware/validators/accessWhitelistValidator");
const { checkAuthToken, checkRole } = require("../middleware/auth");
const ROLE = require("../constants/Role");
const AccessWhitelistService = require("../services/AccessWhitelistService");
const ResponseHandler = require("../ResponseHandler");

const accessWhiteListInst = new AccessWhitelistService();

module.exports = (router) => {
  /**
   * @api {get} /access-whitelist Whitelist User List
   * @apiName Whitelist User List
   * @apiGroup Whitelist User
   *
   *
   * @apiSuccess {String} status Status of the Response.
   * @apiSuccess {String} message  Success Message.
   * @apiSuccess {Object} data  Data
   *
   * @apiSuccessExample {json} Response-Example:
   * {
   *     "status": "success",
   *     "message": "Successfully done"
   *     "data": {
   *         "total": 1,
   *         "records": [
   *             {
   *                 "id": "1d2f9cd5-84c7-4fc9-bafe-cc37f562fba0",
   *                 "name": "Cool Name",
   *                 "email": "someone@localhost.com",
   *                 "phone": "1252254785",
   *                 "status": "active",
   *                 "created_at": "2020-09-01T07:09:11.283Z"
   *             }
   *         ]
   *     }
   * }
   *
   */
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

  /**
   * @api {post} /access-whitelist Whitelist User Add
   * @apiName Whitelist User Add
   * @apiGroup Whitelist User
   *
   *
   * @apiParam (body) {string} email Email of the user OTP was sent to
   * @apiParam (body) {string} [name] name of the user
   * @apiParam (body) {string} [phone] phone of the user
   *
   * @apiParamExample {json} Request-Example:
   * {
   *     "email": "user@localhost.com",
   *     "name": "John Doe",
   *     "phone": "1211211252",
   * }
   *
   *
   * @apiSuccess {String} status Status of the Response.
   * @apiSuccess {String} message  Success Message.
   *
   * @apiSuccessExample {json} Response-Example:
   * {
   *     "status": "success",
   *     "message": "Successfully done"
   * }
   * @apiErrorExample {json} Record not found.
   * {
   *     "code": "NOT_FOUND",
   *     "message": "Not Found",
   *     "httpCode": 404
   * }
   * @apiErrorExample {json} User already whitelisted:
   * {
   *     "code": "CONFLICT",
   *     "message": "User is already whitelisted",
   *     "httpCode": 409
   * }
   */
  router.post(
    "/access-whitelist",
    checkAuthToken,
    checkRole(ROLE.ADMIN),
    accessWhitelistValidator.post,
    (req, res) => {
      ResponseHandler(req, res, accessWhiteListInst.whiteListUser(req.body));
    }
  );

  /**
   * @api {put} /access-whitelist/:id Whitelist User Update
   * @apiName Whitelist User Update
   * @apiGroup Whitelist User
   *
   * @apiParam (param) {string} id Record ID
   *
   * @apiParam (body) {string} email Email of the user OTP was sent to
   * @apiParam (body) {string} [name] name of the user
   * @apiParam (body) {string} [phone] phone of the user
   *
   * @apiParamExample {json} Request-Example:
   * {
   *     "email": "user@localhost.com",
   *     "name": "John Doe",
   *     "phone": "1211211252",
   * }
   *
   *
   * @apiSuccess {String} status Status of the Response.
   * @apiSuccess {String} message  Success Message.
   *
   * @apiSuccessExample {json} Response-Example:
   * {
   *     "status": "success",
   *     "message": "Successfully done"
   * }
   * @apiErrorExample {json} Record not found.
   * {
   *     "code": "NOT_FOUND",
   *     "message": "Not Found",
   *     "httpCode": 404
   * }
   * @apiErrorExample {json} User already whitelisted:
   * {
   *     "code": "CONFLICT",
   *     "message": "User is already whitelisted",
   *     "httpCode": 409
   * }
   */
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

  /**
   * @api {put} /access-whitelist/:id Whitelist User Update Status
   * @apiName Whitelist User Update Status
   * @apiGroup Whitelist User
   *
   * @apiParam (param) {string} id Record ID
   *
   * @apiParam (body) {string} status Status of the record [active|inactive]
   *
   * @apiParamExample {json} Request-Example:
   * {
   *     "status": "active",
   * }
   *
   * @apiSuccess {String} status Status of the Response.
   * @apiSuccess {String} message  Success Message.
   *
   * @apiSuccessExample {json} Response-Example:
   * {
   *     "status": "success",
   *     "message": "Successfully done"
   * }
   * @apiErrorExample {json} Record not found.
   * {
   *     "code": "NOT_FOUND",
   *     "message": "Not Found",
   *     "httpCode": 404
   * }
   *
   */
  router.put(
    "/access-whitelist/:id/status",
    checkAuthToken,
    checkRole(ROLE.ADMIN),
    accessWhitelistValidator.status,
    (req, res) => {
      const { status } = req.body;
      ResponseHandler(
        req,
        res,
        accessWhiteListInst.updateStatus(req.params.id, status)
      );
    }
  );

  /**
   * @api {delete} /access-whitelist/:id Whitelist User Delete
   * @apiName Whitelist User Delete
   * @apiGroup Whitelist User
   *
   * @apiParam (param) {string} id Record ID
   *
   *
   * @apiSuccess {String} status Status of the Response.
   * @apiSuccess {String} message  Success Message.
   *
   * @apiSuccessExample {json} Response-Example:
   * {
   *     "status": "success",
   *     "message": "Successfully done"
   * }
   * @apiErrorExample {json} Record not found.
   * {
   *     "code": "NOT_FOUND",
   *     "message": "Not Found",
   *     "httpCode": 404
   * }
   *
   */
  router.delete(
    "/access-whitelist/:id",
    checkAuthToken,
    checkRole(ROLE.ADMIN),
    (req, res) => {
      ResponseHandler(req, res, accessWhiteListInst.delete(req.params.id));
    }
  );
};
