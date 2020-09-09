const jsonwebtoken = require("jsonwebtoken");
const ResponseHandler = require("../../ResponseHandler");
const errors = require("../../errors");
const ResponseMessage = require("../../constants/ResponseMessage");
const config = require("../../config");

const restrictedAccess = config.app.restricted_access;

async function verifyAccessToken(token) {
  return jsonwebtoken.verify(token, config.jwt.jwt_secret);
}

module.exports = () => {
  if (!restrictedAccess) {
    return function (req, res, next) {
      next();
    };
  }

  return async function (req, res, next) {
    try {
      const accessToken = req.headers["x-access-token"];
      if (!accessToken)
        throw new errors.Unauthorized(ResponseMessage.ACCESS_TOKEN_REQUIRED);

      try {
        await verifyAccessToken(accessToken);
      } catch (error) {
        if (error.name == "TokenExpiredError") {
          throw new errors.Unauthorized(ResponseMessage.ACCESS_TOKEN_EXPIRED);
        }
        throw new errors.Unauthorized(ResponseMessage.ACCESS_TOKEN_INVALID);
      }
      next();
    } catch (error) {
      ResponseHandler(req, res, Promise.reject(error));
    }
  };
};
