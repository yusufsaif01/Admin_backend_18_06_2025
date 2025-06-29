const CountryUtility = require('../db/utilities/CountryUtility');
const errors = require("../errors");
const StateUtility = require('../db/utilities/StateUtility');
const DistrictUtility = require('../db/utilities/DistrictUtility');
const _ = require("lodash");
const LocationListResponseMapper = require("../dataModels/responseMapper/LocationListResponseMapper");
const StateListResponseMapper = require("../dataModels/responseMapper/StateListResponseMapper");
const DistrictListResponseMapper = require("../dataModels/responseMapper/DistrictListResponseMapper");
const RESPONSE_MESSAGE = require('../constants/ResponseMessage');
const PlayerUtility = require('../db/utilities/PlayerUtility')
const ClubAcademyUtility = require('../db/utilities/ClubAcademyUtility');

class LocationService {
    constructor() {
        this.countryUtilityInst = new CountryUtility();
        this.stateUtilityInst = new StateUtility();
        this.districtUtilityInst = new DistrictUtility();
        this.playerUtilityInst = new PlayerUtility();
        this.clubAcademyUtilityInst = new ClubAcademyUtility();
    }

    async getLocationStats() {
        try {
            let data = await this.countryUtilityInst.aggregate([
                { $lookup: { from: "states", localField: "id", foreignField: "country_id", as: "output" } },
                { $project: { total_states: { $size: "$output" }, id: 1, name: 1, output: 1 } },
                { $unwind: { path: "$output", preserveNullAndEmptyArrays: true } },
                { $lookup: { from: "districts", localField: "output.id", foreignField: "state_id", as: "district list" } },
                { $project: { id: 1, total_states: 1, name: 1, total_districts: { $size: "$district list" } } },
                {
                    $group: {
                        _id: { country: "$name", country_id: "$id", total_states: "$total_states" },
                        total_districts: { $sum: "$total_districts" }
                    }
                }])
            data = new LocationListResponseMapper().map(data);
            return Promise.resolve(data)
        } catch (err) {
            return err;
        }
    }
    async addCountry(data = {}) {
        try {
            await this.countryUtilityInst.insert({
                name: data.name,
                phone_code: data.phone_code, sortname: data.sortname
            })
        } catch (err) {
            return err;
        }
    }
    async addState(data = {}) {
        try {
            let reqObj = data.reqObj;
            let country = await this.countryUtilityInst.findOne({ id: reqObj.country_id })
            if (_.isEmpty(country)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.COUNTRY_NOT_FOUND));
            }
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const state = await this.stateUtilityInst.findOne({ name: regex, country_id: reqObj.country_id });
            if (!_.isEmpty(state)) {
                return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.STATE_ALREADY_ADDED));
            }
            await this.stateUtilityInst.insert({ name: reqObj.name, country_id: reqObj.country_id })
            return Promise.resolve()
        } catch (e) {
            console.log("Error in addState() of LocationService", e);
            return Promise.reject(e);
        }
    }
    async getStateList(country_id) {
        try {
            let response = {}, totalRecords = 0;
            let country = await this.countryUtilityInst.findOne({ id: country_id })
            if (_.isEmpty(country)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.COUNTRY_NOT_FOUND));
            }
            totalRecords = await this.stateUtilityInst.countList({ country_id: country_id });
            let projection = { name: 1, id: 1 }
            let data = await this.stateUtilityInst.find({ country_id: country_id }, projection);
            data = new StateListResponseMapper().map(data);
            response = {
                total: totalRecords,
                records: data
            }
            return response;
        } catch (e) {
            console.log("Error in getStateList() of LocationService", e);
            return Promise.reject(e);
        }
    }
    async editState(data = {}) {
        try {
            let country = await this.countryUtilityInst.findOne({ id: data.country_id });
            if (_.isEmpty(country)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.COUNTRY_NOT_FOUND));
            }
            const foundState = await this.stateUtilityInst.findOne({
                id: data.state_id,
                country_id: data.country_id
            })
            if (_.isEmpty(foundState)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.STATE_NOT_FOUND));
            }
            let reqObj = data.reqObj;
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const state = await this.stateUtilityInst.findOne({
                name: regex,
                country_id: data.country_id
            });
            if (!_.isEmpty(state)) {
                if (state.id !== foundState.id)
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.STATE_ALREADY_ADDED));
            }
            await this.stateUtilityInst.updateOne({ id: data.state_id }, { name: reqObj.name })
            await this.playerUtilityInst.updateMany({ "state.id": data.state_id }, { "state.name": reqObj.name });
            await this.clubAcademyUtilityInst.updateMany({ "state.id": data.state_id }, { "state.name": reqObj.name });
            return Promise.resolve()
        } catch (e) {
            console.log("Error in editState() of LocationService", e);
            return Promise.reject(e);
        }
    }
    async addDistrict(data = {}) {
        try {
            let reqObj = data.reqObj;
            let country = await this.countryUtilityInst.findOne({ id: reqObj.country_id });
            if (_.isEmpty(country)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.COUNTRY_NOT_FOUND));
            }
            let foundState = await this.stateUtilityInst.findOne({
                id: reqObj.state_id,
                country_id: reqObj.country_id
            })
            if (_.isEmpty(foundState)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.STATE_NOT_FOUND));
            }
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const district = await this.districtUtilityInst.findOne({ name: regex, state_id: reqObj.state_id });
            if (!_.isEmpty(district)) {
                return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.DISTRICT_ALREADY_ADDED));
            }
            await this.districtUtilityInst.insert({ name: reqObj.name, state_id: reqObj.state_id })
            return Promise.resolve()
        } catch (e) {
            console.log("Error in addDistrict() of LocationService", e);
            return Promise.reject(e);
        }
    }
    async getDistrictList(requestedData = {}) {
        try {
            let conditions = this._prepareSearchCondition(requestedData.filter);

            let paginationOptions = requestedData.paginationOptions || {};
            let skipCount = (paginationOptions.page_no - 1) * paginationOptions.limit;
            let options = { limit: paginationOptions.limit, skip: skipCount };

            let response = {}, totalRecords = 0;
            let country = await this.countryUtilityInst.findOne({ id: requestedData.country_id });
            if (_.isEmpty(country)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.COUNTRY_NOT_FOUND));
            }
            let foundState = await this.stateUtilityInst.findOne({
                id: requestedData.state_id,
                country_id: requestedData.country_id
            })
            if (_.isEmpty(foundState)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.STATE_NOT_FOUND));
            }
            conditions.state_id = requestedData.state_id;
            totalRecords = await this.districtUtilityInst.countList(conditions);
            let projection = { name: 1, id: 1 };
            let data = await this.districtUtilityInst.find(conditions, projection, options);
            data = new DistrictListResponseMapper().map(data);
            response = {
                total: totalRecords,
                records: data
            }
            return response;
        } catch (e) {
            console.log("Error in getDistrictList() of LocationService", e);
            return Promise.reject(e);
        }
    }
    _prepareSearchCondition(filters = {}) {
        let condition = {};
        let filterArr = []
        if (filters.search) {
            filters.search = filters.search.trim().replace(/\s\s+/g, ' ');
            let searchArr = filters.search.split(/\s+/)
            if (searchArr.length) {
                let name = [];
                searchArr.forEach(search => {
                    name.push({ name: new RegExp(search, 'i') })
                });
                filterArr.push({ $or: name })
            }
            condition = {
                $or: filterArr
            };
        }
        return condition;
    }
    async editDistrict(data = {}) {
        try {
            let country = await this.countryUtilityInst.findOne({ id: data.country_id });
            if (_.isEmpty(country)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.COUNTRY_NOT_FOUND));
            }
            let foundState = await this.stateUtilityInst.findOne({
                id: data.state_id,
                country_id: data.country_id
            })
            if (_.isEmpty(foundState)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.STATE_NOT_FOUND));
            }
            let foundDistrict = await this.districtUtilityInst.findOne({
                id: data.district_id,
                state_id: data.state_id
            })
            if (_.isEmpty(foundDistrict)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.DISTRICT_NOT_FOUND));
            }
            let reqObj = data.reqObj;
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const district = await this.districtUtilityInst.findOne({ name: regex, state_id: data.state_id });
            if (!_.isEmpty(district)) {
                if (district.id !== foundDistrict.id)
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.DISTRICT_ALREADY_ADDED));
            }
            await this.districtUtilityInst.updateOne({ id: data.district_id }, { name: reqObj.name })
            await this.playerUtilityInst.updateMany({ "district.id": data.district_id }, { "district.name": reqObj.name });
            await this.clubAcademyUtilityInst.updateMany({ "district.id": data.district_id }, { "district.name": reqObj.name });
            return Promise.resolve()
        } catch (e) {
            console.log("Error in editDistrict() of LocationService", e);
            return Promise.reject(e);
        }
    }
}

module.exports = LocationService;