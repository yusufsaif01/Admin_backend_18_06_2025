const _ = require("lodash");
const errors = require("../errors");
const AbilityUtility = require('../db/utilities/AbilityUtility');
const AttributeUtility = require('../db/utilities/AttributeUtility');
const PositionUtility = require('../db/utilities/PositionUtility');
const AbilityListResponseMapper = require("../dataModels/responseMapper/AbilityListResponseMapper");
const AttributeListResponseMapper = require("../dataModels/responseMapper/AttributeListResponseMapper");
const PositionListResponseMapper = require("../dataModels/responseMapper/PositionListResponseMapper");
const RESPONSE_MESSAGE = require('../constants/ResponseMessage');
const PlayerUtility = require('../db/utilities/PlayerUtility')
const ReportCardUtility = require('../db/utilities/ReportCardUtility');
const { map } = require("bluebird");

class PlayerSpecializationService {

    constructor() {
        this.abilityUtilityInst = new AbilityUtility();
        this.attributeUtilityInst = new AttributeUtility();
        this.positionUtilityInst = new PositionUtility();
        this.playerUtilityInst = new PlayerUtility();
        this.reportCardUtilityInst = new ReportCardUtility();
    }
    async addAbility(data = {}) {
        try {
            let reqObj = data.reqObj;
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const ability = await this.abilityUtilityInst.findOne({ name: regex });
            if (!_.isEmpty(ability)) {
                return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.ABILITY_ALREADY_ADDED));
            }
            await this.abilityUtilityInst.insert({ name: reqObj.name })
            return Promise.resolve()
        } catch (e) {
            console.log("Error in addAbility() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async getAbilityList() {
        try {
            let response = {}, totalRecords = 0;
            totalRecords = await this.abilityUtilityInst.countList({});
            let projection = { id: 1, name: 1 }
            console.log("request come till ability list");
            let data = await this.abilityUtilityInst.find({}, projection);
            data = new AbilityListResponseMapper().map(data);
            response = {
                total: totalRecords,
                records: data
            }
            return response;
        } catch (e) {
            console.log("Error in getAbilityList() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async editAbility(data = {}) {
        try {
            let foundAbility = await this.abilityUtilityInst.findOne({ id: data.ability_id });
            if (_.isEmpty(foundAbility)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.ABILITY_NOT_FOUND));
            }
            let reqObj = data.reqObj;
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const ability = await this.abilityUtilityInst.findOne({ name: regex });
            if (!_.isEmpty(ability)) {
                if (foundAbility.id !== ability.id)
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.ABILITY_ALREADY_ADDED));
            }
            await this.abilityUtilityInst.updateOne({ id: data.ability_id }, { name: reqObj.name })
            await this.reportCardUtilityInst.updateMany({ abilities: { $elemMatch: { ability_id: data.ability_id } } }, { "abilities.$.ability_name": reqObj.name });
            return Promise.resolve()
        } catch (e) {
            console.log("Error in editAbility() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async addAttribute(data = {}) {
        try {
            let reqObj = data.reqObj;
            let foundAbility = await this.abilityUtilityInst.findOne({ id: reqObj.ability_id });
            if (_.isEmpty(foundAbility)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.ABILITY_NOT_FOUND));
            }
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const attribute = await this.attributeUtilityInst.findOne({ name: regex, ability_id: reqObj.ability_id });
            if (!_.isEmpty(attribute)) {
                return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.ATTRIBUTE_ALREADY_ADDED));
            }
            await this.attributeUtilityInst.insert({ name: reqObj.name, ability_id: reqObj.ability_id })
            return Promise.resolve()
        } catch (e) {
            console.log("Error in addAttribute() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async getAttributeList(ability_id) {
        try {
            let response = {}, totalRecords = 0;
            let foundAbility = await this.abilityUtilityInst.findOne({ id: ability_id });
            if (_.isEmpty(foundAbility)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.ABILITY_NOT_FOUND));
            }
            totalRecords = await this.attributeUtilityInst.countList({ ability_id: ability_id });
            let projection = { id: 1, name: 1 }
            let data = await this.attributeUtilityInst.find({ ability_id: ability_id }, projection);
            data = new AttributeListResponseMapper().map(data);
            let abilityName = "";
            abilityName = foundAbility.name ? foundAbility.name : "";
            response = {
                ability: abilityName,
                total: totalRecords,
                records: data
            }
            return response;
        } catch (e) {
            console.log("Error in getAttributeList() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async editAttribute(data = {}) {
        try {
            let foundAbility = await this.abilityUtilityInst.findOne({ id: data.ability_id });
            if (_.isEmpty(foundAbility)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.ABILITY_NOT_FOUND));
            }
            let foundAttribute = await this.attributeUtilityInst.findOne({ id: data.attribute_id, ability_id: data.ability_id });
            if (_.isEmpty(foundAttribute)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.ATTRIBUTE_NOT_FOUND));
            }
            let reqObj = data.reqObj;
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const attribute = await this.attributeUtilityInst.findOne({ name: regex, ability_id: data.ability_id });
            if (!_.isEmpty(attribute)) {
                if (attribute.id !== foundAttribute.id)
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.ATTRIBUTE_ALREADY_ADDED));
            }
            await this.attributeUtilityInst.updateOne({ id: data.attribute_id }, { name: reqObj.name })
            await this.updateAttributeInReportCards(data);
            return Promise.resolve()
        } catch (e) {
            console.log("Error in editAttribute() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async addPositions(data = []) {
        try {
            await this.positionUtilityInst.insertMany(data)
        } catch (err) {
            return err;
        }
    }
    async addPosition(data = {}) {
        try {
            let reqObj = data.reqObj;
            await this.addPositionValidation(reqObj)
            let record = {
                name: reqObj.name,
                abbreviation: reqObj.abbreviation
            }
            if (reqObj.abilities && reqObj.abilities.length)
                record.abilities = reqObj.abilities;
            await this.positionUtilityInst.insert(record)
            return Promise.resolve()
        } catch (e) {
            console.log("Error in addPosition() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async addPositionValidation(reqObj = {}) {
        try {
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            reqObj.abbreviation = reqObj.abbreviation.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            if (_.isEmpty(reqObj.abbreviation)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.ABBREVIATION_CANNOT_BE_EMPTY));
            }
            let nameRegex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            let abbreviationRegex = new RegExp(["^", reqObj.abbreviation, "$"].join(""), "i");
            let conditions = { $or: [{ name: nameRegex }, { abbreviation: abbreviationRegex }] }
            const position = await this.positionUtilityInst.findOne(conditions);
            if (!_.isEmpty(position)) {
                return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.POSITION_ALREADY_ADDED));
            }
            return Promise.resolve()
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async getPositionList() {
        try {
            let response = {}, totalRecords = 0;
            totalRecords = await this.positionUtilityInst.countList({});
            let data = await this.positionUtilityInst.aggregate([
                
                {
                    $lookup: { from: "abilities", localField: "abilities", foreignField: "id", as: "output" }
                },
                {
                    $project: {
                        id: 1, name: 1, abbreviation: 1,
                        abilities: { $map: { input: "$output", as: "ability", in: { id: "$$ability.id", name: "$$ability.name" } } }
                    }
                }])
            data = new PositionListResponseMapper().map(data);
            response = {
                total: totalRecords,
                records: data
            }
            return response;
        } catch (e) {
            console.log("Error in getPositionList() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async editPosition(data = {}) {
        try {
            let reqObj = data.reqObj;
            await this.editPositionValidation(reqObj, data.position_id)
            let record = {
                name: reqObj.name,
                abbreviation: reqObj.abbreviation
            }
            if (reqObj.abilities)
                record.abilities = reqObj.abilities;
            await this.positionUtilityInst.updateOne({ id: data.position_id }, record)
            await this.updatePositionInPlayerDetails(data)
            return Promise.resolve()
        } catch (e) {
            console.log("Error in editPosition() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async editPositionValidation(reqObj = {}, position_id) {
        try {
            const position = await this.positionUtilityInst.findOne({ id: position_id });
            if (_.isEmpty(position)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.POSITION_NOT_FOUND));
            }
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            reqObj.abbreviation = reqObj.abbreviation.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            if (_.isEmpty(reqObj.abbreviation)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.ABBREVIATION_CANNOT_BE_EMPTY));
            }
            let nameRegex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            let abbreviationRegex = new RegExp(["^", reqObj.abbreviation, "$"].join(""), "i");
            const foundPosition = await this.positionUtilityInst.findOne({ name: nameRegex });
            if (!_.isEmpty(foundPosition)) {
                if (foundPosition.id !== position.id)
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.POSITION_WITH_SAME_NAME_ALREADY_ADDED))
            }
            const foundAbbreviation = await this.positionUtilityInst.findOne({ abbreviation: abbreviationRegex });
            if (!_.isEmpty(foundAbbreviation)) {
                if (foundAbbreviation.id !== position.id)
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.POSITION_WITH_SAME_ABBREVIATION_ALREADY_ADDED))
            }
            return Promise.resolve()
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * updates position in player_details collection
     *
     * @param {*} [data={}]
     * @returns
     * @memberof PlayerSpecializationService
     */
    async updatePositionInPlayerDetails(data = {}) {
        try {
            await map([1, 2, 3], async (priority) => {
                await this.playerUtilityInst.updateMany({ position: { $elemMatch: { id: data.position_id, priority: priority } } }, { "position.$.name": data.reqObj.name })
            })
            return Promise.resolve()
        } catch (e) {
            console.log("Error in updatePositionInPlayerDetails() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }

    /**
     * updates attribute in report_cards collection
     *
     * @param {*} [data={}]
     * @returns
     * @memberof PlayerSpecializationService
     */
    async updateAttributeInReportCards(data = {}) {
        try {
            let report_cards = await this.reportCardUtilityInst.find({
                abilities: {
                    $elemMatch: {
                        ability_id: data.ability_id,
                        attributes: { $elemMatch: { attribute_id: data.attribute_id } }
                    }
                }
            },
                { id: 1, _id: 0, abilities: 1 });
            await map(report_cards, async (report_card) => {
                let ability_index = _.findIndex(report_card.abilities, (ability) => {
                    return ability.ability_id == data.ability_id;
                }, 0);
                let attribute_index = _.findIndex(report_card.abilities[ability_index].attributes, (attribute) => {
                    return attribute.attribute_id == data.attribute_id;
                }, 0);
                let updatedDoc = { ["abilities." + ability_index + ".attributes." + attribute_index + ".attribute_name"]: data.reqObj.name }
                await this.reportCardUtilityInst.updateOne({ id: report_card.id }, updatedDoc);
            })
            return Promise.resolve()
        } catch (e) {
            console.log("Error in updateAttributesInReportCards() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
}

module.exports = PlayerSpecializationService;