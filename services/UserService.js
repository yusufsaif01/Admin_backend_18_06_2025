const Promise = require("bluebird");
const errors = require("../errors");
const PlayerUtility = require('../db/utilities/PlayerUtility');
const ClubAcademyUtility = require('../db/utilities/ClubAcademyUtility');
const AuthUtility = require('../db/utilities/AuthUtility');
const LoginUtility = require('../db/utilities/LoginUtility');
const BaseService = require("./BaseService");
const _ = require("lodash");
const UserListResponseMapper = require("../dataModels/responseMapper/UserListResponseMapper");
const MEMBER = require('../constants/MemberType');
const EMAIL_VERIFIED = require('../constants/EmailVerified');
const PLAYER = require('../constants/PlayerType');
const RESPONSE_MESSAGE = require('../constants/ResponseMessage');
const ACCOUNT = require('../constants/AccountStatus');
const ConnectionUtility = require("../db/utilities/ConnectionUtility");
const ConnectionRequestUtility = require('../db/utilities/ConnectionRequestUtility');
const CONNECTION_REQUEST = require('../constants/ConnectionRequestStatus');
const redisServiceInst = require('../redis/RedisService');

class UserService extends BaseService {

    constructor() {
        super();
        this.playerUtilityInst = new PlayerUtility();
        this.clubAcademyUtilityInst = new ClubAcademyUtility();
        this.authUtilityInst = new AuthUtility();
        this.connectionUtilityInst = new ConnectionUtility();
        this.connectionRequestUtilityInst = new ConnectionRequestUtility();
        this.loginUtilityInst = new LoginUtility();
    }

    async getList(requestedData = {}) {
        try {

            let member_type = requestedData.member_type, response = {};

            let conditions = this._prepareSearchCondition(requestedData.filter, member_type);

            let paginationOptions = requestedData.paginationOptions || {};
            let sortOptions = requestedData.sortOptions || {};

            let skipCount = (paginationOptions.page_no - 1) * paginationOptions.limit;
            let options = { limit: paginationOptions.limit, skip: skipCount, sort: {} };

            if (!_.isEmpty(sortOptions.sort_by) && !_.isEmpty(sortOptions.sort_order))
                options.sort[sortOptions.sort_by] = sortOptions.sort_order;

            if (requestedData.filterConditions && (requestedData.filterConditions.email_verified || requestedData.filterConditions.profile_status)) {
                let _condition = {}
                if (requestedData.filterConditions.email_verified)
                    _condition.is_email_verified = (String(requestedData.filterConditions.email_verified).toLowerCase() === EMAIL_VERIFIED.TRUE);
                if (requestedData.filterConditions.profile_status)
                    _condition.profile_status = { status: requestedData.filterConditions.profile_status };


                let users = await this.loginUtilityInst.find(_condition, { user_id: 1 });
                users = _.map(users, "user_id");
                conditions.user_id = { $in: users };
            }

            if (requestedData.filter && requestedData.filter.search) {
                let _condition = {}
                _condition.status = new RegExp(requestedData.filter.search, 'i');

                let users = await this.loginUtilityInst.find(_condition, { user_id: 1 });
                users = _.map(users, "user_id");
                if (conditions.$or)
                    conditions.$or.push({ user_id: { $in: users } });

            }

            filterConditions = this._prepareFilterCondition(requestedData.filterConditions, member_type)
            if (filterConditions) {
                conditions.$and = filterConditions.$and
            }

            if (member_type === MEMBER.PLAYER) {
                response = await this.getPlayerList(conditions, options, member_type);
            } else {
                response = await this.getClubAcademyList(conditions, options, member_type);
            }
            return response
        } catch (e) {
            console.log("Error in getList() of UserUtility", e);
            return Promise.reject(e);
        }
    }

    async getPlayerList(conditions, options, member_type) {
        try {
            let totalRecords = 0, amateur_count = 0, professional_count = 0, grassroot_count = 0;

            totalRecords = await this.playerUtilityInst.countList(conditions);
            amateur_count = await this.playerUtilityInst.countList({ ...conditions, player_type: PLAYER.AMATEUR })
            professional_count = await this.playerUtilityInst.countList({ ...conditions, player_type: PLAYER.PROFESSIONAL })
            grassroot_count = await this.playerUtilityInst.countList({ ...conditions, player_type: PLAYER.GRASSROOT })

            let baseOptions = {
                conditions: conditions,
                options: options,
                projection: { first_name: 1, last_name: 1, player_type: 1, email: 1, position: 1, user_id: 1 }
            };

            let toBePopulatedOptions = {
                path: "login_details",
                projection: { status: 1, is_email_verified: 1, profile_status: 1 }
            };
            let data = await this.playerUtilityInst.populate(baseOptions, toBePopulatedOptions);

            data = new UserListResponseMapper().map(data, member_type);
            let response = {
                total: totalRecords,
                records: data,
                players_count: {
                    grassroot: grassroot_count,
                    professional: professional_count,
                    amateur: amateur_count
                }
            }
            return response;
        } catch (e) {
            console.log("Error in getPlayerList() of UserService", e);
            throw e;
        }
    }

    async getClubAcademyList(conditions, options, member_type) {
        try {
            conditions.member_type = member_type
            const totalRecords = await this.clubAcademyUtilityInst.countList(conditions);

            let baseOptions = {
                conditions: conditions,
                options: options,
                projection: { name: 1, associated_players: 1, email: 1, user_id: 1 }
            };

            let toBePopulatedOptions = {
                path: "login_details",
                projection: { status: 1, is_email_verified: 1, profile_status: 1 }
            };

            let data = await this.clubAcademyUtilityInst.populate(baseOptions, toBePopulatedOptions);

            data = new UserListResponseMapper().map(data, member_type);
            let response = {
                total: totalRecords,
                records: data
            }
            return response;
        } catch (e) {
            console.log("Error in getClubAcademyList() of UserService", e);
            throw e;
        }
    }

    async activate(user_id) {
        try {
            let loginDetails = await this.loginUtilityInst.findOne({ user_id: user_id })
            if (loginDetails) {
                if (!loginDetails.is_email_verified) {
                    return Promise.reject(new errors.Unauthorized(RESPONSE_MESSAGE.EMAIL_NOT_VERIFIED));
                }
                if (loginDetails.status === ACCOUNT.ACTIVE) {
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.STATUS_ALREADY_ACTIVE));
                }
                await this.loginUtilityInst.findOneAndUpdate({ user_id: user_id }, { status: ACCOUNT.ACTIVE })
                return Promise.resolve()
            }
            throw new errors.NotFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
        } catch (e) {
            console.log("Error in activate() of UserService", e);
            return Promise.reject(e);
        }
    }

    async deactivate(user_id) {
        try {
            let loginDetails = await this.loginUtilityInst.findOne({ user_id: user_id })
            if (loginDetails) {
                if (!loginDetails.is_email_verified) {
                    return Promise.reject(new errors.Unauthorized(RESPONSE_MESSAGE.EMAIL_NOT_VERIFIED));
                }
                if (loginDetails.status === ACCOUNT.BLOCKED) {
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.STATUS_ALREADY_BLOCKED));
                }
                await this.loginUtilityInst.findOneAndUpdate({ user_id: user_id }, { status: ACCOUNT.BLOCKED })
                await redisServiceInst.clearAllTokensFromCache(user_id);
                return Promise.resolve()
            }
            throw new errors.NotFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
        } catch (e) {
            console.log("Error in deactivate() of UserService", e);
            return Promise.reject(e);
        }
    }

    async delete(user_id) {
        try {
            let loginDetails = await this.loginUtilityInst.findOne({ user_id: user_id })
            if (loginDetails) {
                let date = Date.now()
                await this.loginUtilityInst.findOneAndUpdate({ user_id: user_id }, { is_deleted: true, deleted_at: date })
                await this.manageConnection(user_id);
                if (loginDetails.member_type === MEMBER.PLAYER) {
                    await this.playerUtilityInst.findOneAndUpdate({ user_id: user_id }, { deleted_at: date })
                }
                else {
                    await this.clubAcademyUtilityInst.findOneAndUpdate({ user_id: user_id }, { deleted_at: date })
                }
                await redisServiceInst.clearAllTokensFromCache(user_id);
                return Promise.resolve()
            }
            throw new errors.NotFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
        } catch (e) {
            console.log("Error in delete() of UserService", e);
            return Promise.reject(e);
        }
    }

    async manageConnection(user_id) {
        try {
            let connection_of_user = await this.connectionUtilityInst.findOne({ user_id: user_id });
            if (connection_of_user) {
                if (connection_of_user.footmates) {
                    await this.connectionUtilityInst.updateMany({ user_id: { $in: connection_of_user.footmates } }, { $pull: { footmates: user_id } })
                }
                if (connection_of_user.followers) {
                    await this.connectionUtilityInst.updateMany({ user_id: { $in: connection_of_user.followers } }, { $pull: { followings: user_id } })
                }
                if (connection_of_user.followings) {
                    await this.connectionUtilityInst.updateMany({ user_id: { $in: connection_of_user.followings } }, { $pull: { followers: user_id } })
                }
                let updatedDoc = { is_deleted: true, deleted_at: Date.now() };
                await this.connectionUtilityInst.updateOne({ user_id: user_id }, updatedDoc);
                let condition = { $or: [{ sent_by: user_id, status: CONNECTION_REQUEST.PENDING }, { send_to: user_id, status: CONNECTION_REQUEST.PENDING }] };
                updatedDoc.status = CONNECTION_REQUEST.REJECTED;
                await this.connectionRequestUtilityInst.updateMany(condition, updatedDoc);
            }
            return Promise.resolve();
        }
        catch (e) {
            console.log("Error in manageConnection() of UserService", e);
            return Promise.reject(e);
        }
    }

    _prepareFilterCondition(filterConditions = {}, member_type) {
        let condition = {};
        let filterArr = []
        if (filterConditions) {
            if (filterConditions.email) {
                filterArr.push({ email: new RegExp(filterConditions.email, 'i') })
            }

            if (filterConditions.from && filterConditions.to) {
                filterArr.push({
                    createdAt: {
                        $gte: filterConditions.from,
                        $lte: filterConditions.to
                    }
                })
            }
            if (member_type === MEMBER.PLAYER) {
                if (filterConditions.name) {
                    let nameArr = filterConditions.name.split(/\s+/)
                    if (nameArr.length) {
                        let name = [];
                        nameArr.forEach(search => {
                            name.push({ first_name: new RegExp(search, 'i') })
                            name.push({ last_name: new RegExp(search, 'i') })
                        });
                        filterArr.push({ $or: name })
                    }
                    else {
                        filterArr.push({
                            $or: [
                                { first_name: new RegExp(filterConditions.name, 'i') },
                                { last_name: new RegExp(filterConditions.name, 'i') }
                            ]
                        });
                    }
                }
                if (filterConditions.position) {
                    filterArr.push({
                        position: {
                            $elemMatch: {
                                name: new RegExp(filterConditions.position, 'i'),
                                priority: 1
                            }
                        }
                    })
                }
                if (filterConditions.type) {
                    filterArr.push({ player_type: new RegExp(filterConditions.type, 'i') })
                }
            } else {
                if (filterConditions.name) {
                    filterArr.push({
                        name: new RegExp(filterConditions.name, 'i')
                    });
                }
            }
            condition = {
                $and: filterArr
            }
        }
        return filterArr.length ? condition : null
    }



    _prepareSearchCondition(filters = {}, member_type) {
        let condition = {};
        let filterArr = []
        if (filters.search) {
            filters.search = filters.search.trim()
            if (member_type == MEMBER.PLAYER) {
                let searchArr = filters.search.split(/\s+/)
                if (searchArr.length) {
                    let name = [];
                    searchArr.forEach(search => {
                        name.push({ first_name: new RegExp(search, 'i') })
                        name.push({ last_name: new RegExp(search, 'i') })
                    });
                    filterArr.push({ $or: name })
                }
                else {
                    filterArr.push({ first_name: new RegExp(filters.search, 'i') })
                    filterArr.push({ last_name: new RegExp(filters.search, 'i') })
                }
                filterArr.push({ player_type: new RegExp(filters.search, 'i') })
                filterArr.push({
                    position: {
                        $elemMatch: {
                            name: new RegExp(filters.search, "i"),
                            priority: 1
                        }
                    }
                })
            }
            else {
                filterArr.push({ name: new RegExp(filters.search, 'i') })
                let num = Number(filters.search)
                if (!isNaN(num)) {
                    if (num === 0)
                        filterArr.push({ associated_players: null })
                    filterArr.push({ associated_players: num })
                }
            }
            filterArr.push({
                email: new RegExp(filters.search, "i")
            })
            condition = {
                $or: filterArr
            };
        }
        return condition;
    }
}

module.exports = UserService;