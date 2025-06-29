const _ = require("lodash");
const Model = require("../model");
const errors = require("../../errors");

class BaseUtility {
  constructor(schemaObj) {
    this.schemaObj = schemaObj;
  }

  async getModel() {
    this.model = await Model.getModel(this.schemaObj);
  }

  async findOne(conditions = {}, projection = [], options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      conditions.deleted_at = { $exists: false };

      projection = !_.isEmpty(projection) ? projection : { _id: 0, __v: 0 };

      let result = await this.model
        .findOne(conditions, projection, options)
        .lean();

      return result;
    } catch (e) {
      console.log(
        `Error in findOne() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async find(conditions = {}, projection = {}, options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      conditions.deleted_at = { $exists: false };

      if (options && (!options.sort || !Object.keys(options.sort).length)) {
        options.sort = { createdAt: -1 };
      }

      projection = !_.isEmpty(projection) ? projection : { _id: 0, __v: 0 };
      let result = await this.model.find(conditions, projection);
      return result;
    } catch (e) {
      console.log(
        `Error in find() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }
  async findAds(conditions = {}, projection = {}, options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      
      if (options && (!options.sort || !Object.keys(options.sort).length)) {
        options.sort = { createdAt: -1 };
      }

      projection = !_.isEmpty(projection) ? projection : { _id: 0, __v: 0 };
      let result = await this.model.find(conditions, projection);
      return result;
    } catch (e) {
      console.log(
        `Error in find() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }
  async countList(conditions = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      conditions.deleted_at = { $exists: false };

      let count = await this.model.countDocuments(conditions);
      return count;
    } catch (e) {
      console.log(
        `Error in find() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async insert(record = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      let result = await this.model.create(record);
      return result;
    } catch (e) {
      console.log(
        `Error in insert() while inserting data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async insertMany(recordsToInsert = []) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      let result = await this.model.insertMany(recordsToInsert);
      return result;
    } catch (e) {
      if (e.code === 11000) {
        return Promise.reject(new errors.Conflict(e.errmsg));
      }
      console.log(
        `Error in insertMany() while inserting data for ${this.schemaObj.schemaName} :: ${e}`
      );
      return Promise.reject(new errors.DBError(e.errmsg));
    }
  }

  async updateMany(conditions = {}, updatedDoc = {}, options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      conditions.deleted_at = { $exists: false };
      console.log("condition is ------->");
      console.log(conditions);
      console.log("update docs =====>");
      console.log(updatedDoc);
      console.log("options is ======>");
      console.log(options);
      let result = await this.model.update(conditions, updatedDoc, options);
      return result;
    } catch (e) {
      console.log(
        `Errorssssssss in updateMany() while updating data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async updateOne(conditions = {}, updatedDoc = {}, options = {}) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      conditions.deleted_at = { $exists: false };

      let result = await this.model.updateOne(conditions, updatedDoc, options);
      console.log(result);
      return result;
    } catch (e) {
      console.log(
        `Error in updateOne() while updating data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async findOneAndUpdate(conditions = {}, updatedDoc = {}, options = {}) {
    try {
      let entity = await this.findOne(conditions, null, options);
      if (!entity) {
        return Promise.reject(new errors.NotFound());
      }
      conditions.deleted_at = { $exists: false };
      options.new = true;
      return this.model.findOneAndUpdate(conditions, updatedDoc, options);
    } catch (e) {
      console.log(
        `Error in findOneAndUpdate() while updating data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }

  async populate(baseOptions = {}, toBePopulatedOptions = {}) {
    try {
      baseOptions.projection = !_.isEmpty(baseOptions.projection)
        ? baseOptions.projection
        : { _id: 0, __v: 0 };
      toBePopulatedOptions.projection = !_.isEmpty(
        toBePopulatedOptions.projection
      )
        ? toBePopulatedOptions.projection
        : { _id: 0, __v: 0 };

      const data = await this.model
        .find(
          baseOptions.conditions || {},
          baseOptions.projection || null,
          baseOptions.options || {}
        )
        .populate({
          path: toBePopulatedOptions.path,
          match: toBePopulatedOptions.condition || {},
          select: toBePopulatedOptions.projection || null,
        })
        .exec();
      return data;
    } catch (e) {
      console.log(
        `Error in populate() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }
  async aggregate(aggregations = []) {
    try {
      if (_.isEmpty(this.model)) {
        await this.getModel();
      }
      const data = await this.model.aggregate(aggregations);
      return data;
    } catch (e) {
      console.log(
        `Error in aggregate() while fetching data for ${this.schemaObj.schemaName} :: ${e}`
      );
      throw e;
    }
  }
}

module.exports = BaseUtility;