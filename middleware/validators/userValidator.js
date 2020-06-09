const Joi = require('@hapi/joi');
const errors = require("../../errors");
const responseHandler = require("../../ResponseHandler");
const SORT_ORDER = require('../../constants/SortOrder');
const PROFILE = require('../../constants/ProfileStatus');
const EMAIL_VERIFIED = require('../../constants/EmailVerified');
class UserValidator {

    async playerListQueryValidation(req, res, next) {

        const query = Joi.object().keys({
            "page_no": Joi.number(),
            "page_size": Joi.number(),
            "sort_order": Joi.number().valid([SORT_ORDER.ASCENDING, SORT_ORDER.DESCENDING]),
            "sort_by": Joi.string(),
            "from": Joi.string(),
            "to": Joi.string(),
            "search": Joi.string(),
            "email": Joi.string(),
            "name": Joi.string(),
            "position": Joi.string(),
            "type": Joi.string(),
            "profile_status": Joi.string().valid([PROFILE.VERIFIED, PROFILE.NON_VERIFIED]),
            "email_verified": Joi.string().valid([EMAIL_VERIFIED.TRUE, EMAIL_VERIFIED.FALSE]),
        })
        try {

            await Joi.validate(req.query, query);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
    async clubAcademyListQueryValidation(req, res, next) {

        const query = Joi.object().keys({
            "page_no": Joi.number(),
            "page_size": Joi.number(),
            "sort_order": Joi.number().valid([SORT_ORDER.ASCENDING, SORT_ORDER.DESCENDING]),
            "sort_by": Joi.string(),
            "from": Joi.string(),
            "to": Joi.string(),
            "search": Joi.string(),
            "email": Joi.string(),
            "name": Joi.string(),
            "profile_status": Joi.string().valid([PROFILE.VERIFIED, PROFILE.NON_VERIFIED]),
            "email_verified": Joi.string().valid([EMAIL_VERIFIED.TRUE, EMAIL_VERIFIED.FALSE]),
        })
        try {

            await Joi.validate(req.query, query);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
}

module.exports = new UserValidator();

