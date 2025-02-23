const AdsSchema = require("../schemas/AdsSchema");
const BaseUtility = require("./BaseUtility");

class AdsUtility extends BaseUtility {
  constructor() {
    super(AdsSchema);
  }
}

module.exports = AdsUtility;
