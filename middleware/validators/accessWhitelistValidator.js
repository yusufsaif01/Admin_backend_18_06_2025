const Joi = require("@hapi/joi");
const errors = require("../../errors");
const responseHandler = require("../../ResponseHandler");
const ResponseMessage = require("../../constants/ResponseMessage");
const WhitelistStatus = require("../../constants/WhitelistStatus");

class AccessWhitelistValidator {
  async post(req, res, next) {
    const schema = Joi.object().keys({
      name: Joi.string()
        .regex(/^(?:[0-9]+[ a-zA-Z]|[a-zA-Z])[a-zA-Z0-9 ]*$/)
        .empty("")
        .optional("")
        .default("")
        .error(() => ResponseMessage.NAME_INVALID),
      phone: Joi.string()
        .regex(/^[0-9]{10}$/)
        .empty("")
        .optional("")
        .default("")
        .error(() => ResponseMessage.PHONE_NUMBER_INVALID),
      email: Joi.string().required().email(),
    });
    try {
      const reqBody = await Joi.validate(req.body, schema);
      req.body = reqBody;
      return next();
    } catch (err) {
      console.log(err.details);
      return responseHandler(
        req,
        res,
        Promise.reject(new errors.ValidationFailed(err.details[0].message))
      );
    }
  }
  async status(req, res, next) {
    const schema = Joi.object().keys({
      status: Joi.string().required().valid(WhitelistStatus.ALLOWED_STATUS),
    });
    try {
      const reqBody = await Joi.validate(req.body, schema);
      req.body = reqBody;
      return next();
    } catch (err) {
      console.log(err.details);
      return responseHandler(
        req,
        res,
        Promise.reject(new errors.ValidationFailed(err.details[0].message))
      );
    }
  }
}

module.exports = new AccessWhitelistValidator();
