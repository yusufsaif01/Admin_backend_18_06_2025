const AccessWhitelistUtility = require("../db/utilities/AccessWhitelistUtility");
const errors = require("../errors");
const ResponseMessage = require("../constants/ResponseMessage");
const WhiteListResponseMapper = require("../dataModels/responseMapper/WhitelistResponseMapper");

module.exports = class AccessWhitelistService {
  constructor() {
    this.accessWhiteListInst = new AccessWhitelistUtility();
  }

  async whiteListUser(data) {
    try {
      await this.checkDuplicateRecord(data);

      await this.accessWhiteListInst.insert(data);
      return Promise.resolve();
    } catch (error) {
      console.log("Error in whitelisting user", error);
      return Promise.reject(error);
    }
  }

  async checkDuplicateRecord(data, id = null) {
    const getRecord = await this.getByEmail(data.email, id);

    if (getRecord) {
      throw new errors.Conflict(ResponseMessage.USER_ALREADY_WHITELISTED);
    }
  }

  async getByEmail(email, ignore = null) {
    try {
      const where = {
        email,
        is_deleted: false,
      };
      if (ignore) where["id"] = { $ne: ignore };
      const record = await this.accessWhiteListInst.findOne(where);
      return record;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateOne(id, data) {
    try {
      await this.checkDuplicateRecord(data, id);
      const response = this.updateWhiteListUser(
        {
          id,
        },
        data
      );
      if (!response.n) {
        throw new errors.NotFound();
      }
    } catch (error) {
      console.log("error in updateOne whitelist user", error);
      return Promise.reject(error);
    }
  }

  async updateWhiteListUser(where, data) {
    try {
      return await this.accessWhiteListInst.updateOne(where, data);
    } catch (error) {
      console.log("error in updating whitelisted record", error);
      return Promise.reject(error);
    }
  }

  async delete(id) {
    try {
      const response = await this.updateWhiteListUser(
        { id: id, is_deleted: false },
        { is_deleted: true }
      );
      if (!response.n) {
        throw new errors.NotFound();
      }
      return Promise.resolve();
    } catch (error) {
      console.log("error in deleting whitelisted record", error);
      return Promise.reject(error);
    }
  }

  async getList(query) {
    try {
      const where = { is_deleted: false };

      const skip = (query.page - 1) * query.pageSize;

      const pipeLines = [
        { $match: where },
        { $limit: query.pageSize },
        { $skip: skip },
      ];

      return {
        total: await this.accessWhiteListInst.countList(where),
        records: WhiteListResponseMapper.map(
          await this.accessWhiteListInst.aggregate(pipeLines)
        ),
      };
    } catch (error) {
      console.log("Error in getting list", error);
      return Promise.reject(error);
    }
  }
};
