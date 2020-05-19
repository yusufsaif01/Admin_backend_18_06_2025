class ResponseMessage {
    static get ACTIVATION_LINK_EXPIRED() {
        return "Activation link expired";
    }
    static get LINK_EXPIRED() {
        return "Link has been expired";
    }
    static get EMAIL_NOT_VERIFIED() {
        return "Email is not verified";
    }
    static get USER_NOT_REGISTERED() {
        return "User is not registered";
    }
    static get USER_AUTHENTICATION_FAILED() {
        return "User authentication failed";
    }
    static get USER_NOT_FOUND() {
        return "User not found";
    }
    static get MEMBER_NOT_FOUND() {
        return "Member not found";
    }
    static get USER_BLOCKED() {
        return "Your account has been deactivated. Please contact admin for help";
    }
    static get USER_INACTIVE() {
        return "User is not active";
    }
    static get STATUS_ALREADY_ACTIVE() {
        return "Status is already active"
    }
    static get STATUS_ALREADY_BLOCKED() {
        return "Status is already blocked"
    }
    static get ACHIEVEMENT_NOT_FOUND() {
        return "Achievement not found"
    }
    static get COUNTRY_NOT_FOUND() {
        return "Country not found"
    }
    static get STATE_NOT_FOUND() {
        return "State not found"
    }
    static get CITY_NOT_FOUND() {
        return "City not found"
    }
    static get ABILITY_NOT_FOUND() {
        return "Ability not found"
    }
    static get PARAMETER_NOT_FOUND() {
        return "Parameter not found"
    }
    static get POSITION_NOT_FOUND() {
        return "Position not found"
    }
    static get STATE_ALREADY_ADDED() {
        return "State already added"
    }
    static get CITY_ALREADY_ADDED() {
        return "City already added"
    }
    static get ABILITY_ALREADY_ADDED() {
        return "Ability already added"
    }
    static get PARAMETER_ALREADY_ADDED() {
        return "Parameter already added"
    }
    static get POSITION_ALREADY_ADDED() {
        return "Position already added"
    }
    static get POSITION_WITH_SAME_NAME_ALREADY_ADDED() {
        return "Position with same name already added"
    }
    static get POSITION_WITH_SAME_ABBREVIATION_ALREADY_ADDED() {
        return "Position with same abbreviation already added"
    }
    static get NAME_CANNOT_BE_EMPTY() {
        return "Name cannot be empty"
    }
    static get ABBREVIATION_CANNOT_BE_EMPTY() {
        return "Abbreviation cannot be empty"
    }
}

module.exports = ResponseMessage