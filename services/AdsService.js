const AdsUtility = require("../db/utilities/AdsUtility");
const MemberTypeListResponseMapper = require("../dataModels/responseMapper/MemberTypeListResponseMapper");

class AdsService {
  constructor() {
    this.adsUtilityInst = new AdsUtility();
  }

  async adsUpload(data) {
    try {
      console.log("data before processing:", data);
     

      // Ensure position is an array
      if (typeof data.position === "string") {
        data.position = JSON.parse(data.position); // Convert string to array
      }

      console.log("data after processing:", data);

      let res = await this.adsUtilityInst.insert(data);
      console.log("response check", res);

      return Promise.resolve(res);
    } catch (e) {
      console.log("Error in adsUpload():", e);
      return Promise.reject(e);
    }
  }
}

module.exports = AdsService;
