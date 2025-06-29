const LoginUtility = require("../db/utilities/LoginUtility");
const MEMBER = require("../constants/MemberType");
const PROFILE_STATUS = require("../constants/ProfileStatus");
const CONTRACT_STATUS = require("../constants/ContractStatus");
const RESPONSE_MESSAGE = require("../constants/ResponseMessage");
const _ = require("lodash");
const PlayerUtility = require("../db/utilities/PlayerUtility");
const EmploymentContractUtility = require("../db/utilities/EmploymentContractUtility");
const errors = require("../errors");
const EmailService = require("./EmailService");
const config = require("../config");
const ROLE = require("../constants/Role");
const moment = require('moment');
const PLAYER = require("../constants/PlayerType");
const DOCUMENT_TYPE = require('../constants/DocumentType');
const DOCUMENT_STATUS = require('../constants/DocumentStatus')
const AdminUtility = require("../db/utilities/AdminUtility");

class EmploymentContractService {
  constructor() {
    this.loginUtilityInst = new LoginUtility();
    this.playerUtilityInst = new PlayerUtility();
    this.emailService = new EmailService();
    this.employmentContractUtilityInst = new EmploymentContractUtility();
    this.adminUtilityInst = new AdminUtility();
  }

  /**
   * get employment contract details
   *
   * @param {*} [requestedData={}]
   * @returns
   * @memberof EmploymentContractService
   */
  async getEmploymentContractDetails(requestedData = {}) {
    try {
      let data = await this.checkEmploymentContractAccess(requestedData);
      let sentByUser = await this.loginUtilityInst.findOne(
        { user_id: data.sent_by },
        { member_type: 1 }
      );
      let sendToUser = await this.loginUtilityInst.findOne(
        { user_id: data.send_to },
        { member_type: 1 }
      );
      data.created_by = sentByUser ? sentByUser.member_type : "";
      data.send_to_category = sendToUser ? sendToUser.member_type : "";
      return data;
    } catch (e) {
      console.log("Error in getEmploymentContractDetails() of EmploymentContractService", e);
      return Promise.reject(e);
    }
  }

  /**
   * checks if the logged_in user can view employment contract
   *
   * @param {*} [requestedData={}]
   * @returns
   * @memberof EmploymentContractService
   */
  async checkEmploymentContractAccess(requestedData = {}) {
    let data = await this.employmentContractUtilityInst.findOne({ id: requestedData.id }, { createdAt: 0, updatedAt: 0, _id: 0, __v: 0 });
    if (!data) {
      return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.EMPLOYMENT_CONTRACT_NOT_FOUND));
    }
    let user = requestedData.user;
    if (user.role !== ROLE.ADMIN && user.user_id !== data.sent_by && user.user_id !== data.send_to) {
      return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.EMPLOYMENT_CONTRACT_ACCESS_DENIED));
    }
    return Promise.resolve(data);
  }

  /**
   * get list of employment contracts related to user_id
   *
   * @param {*} [requestedData={}]
   * @returns
   * @memberof EmploymentContractService
   */
  async getEmploymentContractList(requestedData = {}) {
    try {
      await this.validateUserId(requestedData);
      let paginationOptions = requestedData.paginationOptions || {};
      let skipCount = (paginationOptions.page_no - 1) * paginationOptions.limit;
      let options = { limit: paginationOptions.limit, skip: skipCount };
      let matchCondition = { is_deleted: false, $or: [{ sent_by: requestedData.user_id }, { send_to: requestedData.user_id }] };
      if (requestedData.role === ROLE.PLAYER || requestedData.role === ROLE.ADMIN) {
        matchCondition.status = { $ne: CONTRACT_STATUS.REJECTED }
      }
      let data = await this.employmentContractUtilityInst.aggregate([{ $match: matchCondition }, { $sort: { createdAt: -1 } },
      { "$lookup": { "from": "login_details", "localField": "sent_by", "foreignField": "user_id", "as": "login_detail" } },
      { $unwind: { path: "$login_detail" } }, { "$lookup": { "from": "club_academy_details", "localField": "club_academy_email", "foreignField": "email", "as": "clubAcademyDetail" } },
      {
        $project: {
          clubAcademyDetail: { $filter: { input: "$clubAcademyDetail", as: "element", cond: { $eq: [{ $ifNull: ["$$element.deleted_at", null] }, null] } } },
          id: 1, player_name: 1, club_academy_name: 1, effective_date: 1, expiry_date: 1, status: 1, login_detail: 1, send_to: 1 
        }
      },
      { $unwind: { path: "$clubAcademyDetail", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0, id: 1, player_name: "$player_name", name: "$club_academy_name", club_academy_user_id: "$clubAcademyDetail.user_id",
          effective_date: 1, expiry_date: 1, status: 1, created_by: "$login_detail.member_type",
          can_update_status: { $cond: { if: { $eq: [null, "$send_to"] }, then: true, else: false } }
        }
      },
      { $facet: { data: [{ $skip: options.skip }, { $limit: options.limit },], total_data: [{ $group: { _id: null, count: { $sum: 1 } } }] } }
      ]);
      let responseData = [], totalRecords = 0;
      if (data && data.length && data[0] && data[0].data) {
        responseData = data[0].data
        if (data[0].data.length && data[0].total_data && data[0].total_data.length && data[0].total_data[0].count) {
          totalRecords = data[0].total_data[0].count;
        }
      }

      let response = { total: totalRecords, records: responseData };
      return response;

    } catch (e) {
      console.log("Error in getEmploymentContractList() of EmploymentContractService", e);
      return Promise.reject(e);
    }
  }

  /**
   * validates user_id
   *
   * @param {*} [requestedData={}]
   * @returns
   * @memberof EmploymentContractService
   */
  async validateUserId(requestedData = {}) {
    let user = await this.loginUtilityInst.findOne({ user_id: requestedData.user_id });
    if (!user) {
      return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.USER_NOT_FOUND));
    }
    return Promise.resolve();
  }

  /**
 * updates employment contract status
 *
 * @param {*} [requestedData={}]
 * @returns
 * @memberof EmploymentContractService
 */
  async updateEmploymentContractStatus(requestedData = {}) {
    try {
      let { isSendToPlayer, data } = await this.isAllowedToUpdateStatus(requestedData);
      let sentByUser = await this.loginUtilityInst.findOne({ user_id: data.sent_by }, { username: 1, member_type: 1 });
      let player_name = "", playerEmail = "", playerUserId = "", playerType = "", documents = [], loggedInUser = requestedData.user;
      if (isSendToPlayer || sentByUser.member_type === MEMBER.PLAYER) {
        playerUserId = isSendToPlayer ? data.send_to : data.sent_by;
        let player = await this.playerUtilityInst.findOne({ user_id: playerUserId }, { first_name: 1, last_name: 1, player_type: 1, documents: 1, email:1 });
        player_name = `${player.first_name} ${player.last_name}`;
        playerType = player.player_type;
        playerEmail = player.email;
        documents = player.documents;
      }
      let reqObj = requestedData.reqObj;
      if (reqObj.status === CONTRACT_STATUS.APPROVED) {
        await this.checkForActiveContract({ id: requestedData.id, playerUserId: playerUserId });
        let status = this.getEmploymentContractStatus(data);
        await this.employmentContractUtilityInst.updateOne({ id: requestedData.id }, { status: status });
        await this.rejectOtherContracts({ id: requestedData.id, playerUserId: playerUserId });
        await this.convertToProfessional({ playerUserId: playerUserId, playerType: playerType });
        await this.updateProfileStatus({ id: requestedData.id, playerUserId: playerUserId, documents: documents, status: reqObj.status });
        await this.emailService.employmentContractApproval({ email: sentByUser.username, name: player_name });
        await this.sendEmailToAdmins({
          loggedInUser: loggedInUser,
          status: CONTRACT_STATUS.APPROVED,
          reason: "",
          name: player_name,
          email: playerEmail,
        });
      }
      if (reqObj.status === CONTRACT_STATUS.DISAPPROVED) {
        await this.employmentContractUtilityInst.updateOne({ id: requestedData.id }, { status: CONTRACT_STATUS.DISAPPROVED });
        await this.updateProfileStatus({ id: requestedData.id, playerUserId: playerUserId, documents: documents, status: reqObj.status });
        await this.emailService.employmentContractDisapproval({ email: sentByUser.username, name: player_name, reason: reqObj.remarks });
        await this.sendEmailToAdmins({
          loggedInUser: loggedInUser,
          status: CONTRACT_STATUS.DISAPPROVED,
          name: player_name,
          email: playerEmail,
          reason: reqObj.remarks,
        });
      }
      return Promise.resolve();
    } catch (e) {
      console.log("Error in updateEmploymentContractStatus() of EmploymentContractService", e);
      return Promise.reject(e);
    }
  }

  /**
   * checks if the logged_in user is allowed to update employment contract status
   *
   * @param {*} [requestedData={}]
   * @returns
   * @memberof EmploymentContractService
   */
  async isAllowedToUpdateStatus(requestedData = {}) {
    let data = await this.checkEmploymentContractAccess(requestedData);
    let user = requestedData.user;
    let isSendToPlayer = false;
    if (data.send_to) {
      let foundUser = await this.loginUtilityInst.findOne({ user_id: data.send_to });
      if (!foundUser && user.role !== ROLE.ADMIN) {
        return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.CANNOT_UPDATE_CONTRACT_STATUS));
      }
      if (foundUser) {
        if (user.user_id !== foundUser.user_id) {
          return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.CANNOT_UPDATE_CONTRACT_STATUS));
        }
        if (foundUser.member_type === MEMBER.PLAYER) {
          isSendToPlayer = true
        }
      }
    }
    if (!data.send_to && user.role !== ROLE.ADMIN) {
      return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.CANNOT_UPDATE_CONTRACT_STATUS));
    }
    return Promise.resolve({ isSendToPlayer: isSendToPlayer, data: data });
  }

  /**
   * returns status for to be approved employment contract 
   *
   * @param {*} data
   * @returns
   * @memberof EmploymentContractService
   */
  getEmploymentContractStatus(data) {
    let date = new Date();
    let dateNow = moment(date).format("YYYY-MM-DD");
    let effective_date = moment(data.effective_date).format("YYYY-MM-DD");
    let expiry_date = moment(data.expiry_date).format("YYYY-MM-DD");
    if (dateNow < effective_date) {
      return CONTRACT_STATUS.YET_TO_START;
    }
    if (expiry_date > dateNow) {
      return CONTRACT_STATUS.ACTIVE;
    }
    if (expiry_date <= dateNow) {
      return CONTRACT_STATUS.COMPLETED;
    }
  }

  /**
   * rejects other contracts related to player
   *
   * @param {*} [requestedData={}]
   * @returns
   * @memberof EmploymentContractService
   */
  async rejectOtherContracts(requestedData = {}) {
    try {
      let condition = { status: CONTRACT_STATUS.PENDING, id: { $ne: requestedData.id }, $or: [{ sent_by: requestedData.playerUserId }, { send_to: requestedData.playerUserId }] };
      await this.employmentContractUtilityInst.updateMany(condition, { status: CONTRACT_STATUS.REJECTED });
      return Promise.resolve();
    } catch (e) {
      console.log("Error in rejectOtherContracts() of EmploymentContractService", e);
      return Promise.reject(e);
    }
  }

  /**
   * updates player type to professional
   *
   * @param {*} [requestedData={}]
   * @returns
   * @memberof EmploymentContractService
   */
  async convertToProfessional(requestedData = {}) {
    try {
      if (requestedData.playerType !== PLAYER.PROFESSIONAL) {
        await this.playerUtilityInst.updateOne({ user_id: requestedData.playerUserId }, { player_type: PLAYER.PROFESSIONAL });
      }
      return Promise.resolve();
    } catch (e) {
      console.log("Error in convertToProfessional() of EmploymentContractService", e);
      return Promise.reject(e);
    }
  }

  /**
   * updates profile status of player
   *
   * @param {*} [requestedData={}]
   * @returns
   * @memberof EmploymentContractService
   */
  async updateProfileStatus(requestedData = {}) {
    try {
      let profileStatus = PROFILE_STATUS.NON_VERIFIED;
      if (requestedData.status === CONTRACT_STATUS.DISAPPROVED) {
        let condition = {
          id: { $ne: requestedData.id }, is_deleted: false, status: { $in: [CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.COMPLETED, CONTRACT_STATUS.YET_TO_START] },
          $or: [{ sent_by: requestedData.playerUserId }, { send_to: requestedData.playerUserId }]
        };
        let playerContract = await this.employmentContractUtilityInst.findOne(condition);
        profileStatus = playerContract ? PROFILE_STATUS.VERIFIED : PROFILE_STATUS.NON_VERIFIED;
      }
      if (requestedData.status === CONTRACT_STATUS.APPROVED) {
        let aadhaar = _.find(requestedData.documents, { type: DOCUMENT_TYPE.AADHAR });
        if (aadhaar && aadhaar.status === DOCUMENT_STATUS.APPROVED)
          profileStatus = PROFILE_STATUS.VERIFIED;
      }
      await this.loginUtilityInst.updateOne({ user_id: requestedData.playerUserId }, { "profile_status.status": profileStatus });
      return Promise.resolve();
    } catch (e) {
      console.log("Error in updateProfileStatus() of EmploymentContractService", e);
      return Promise.reject(e);
    }
  }

  /**
   * checks for other active contracts
   *
   * @param {*} [requestedData={}]
   * @returns
   * @memberof EmploymentContractService
   */
  async checkForActiveContract(requestedData = {}) {
    try {
      let condition = { status: CONTRACT_STATUS.ACTIVE, $or: [{ sent_by: requestedData.playerUserId }, { send_to: requestedData.playerUserId }] };
      let foundContract = await this.employmentContractUtilityInst.findOne(condition, { id: 1 });
      if (foundContract && requestedData.id !== foundContract.id) {
        return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.ANOTHER_ACTIVE_CONTRACT_EXIST));
      }
      return Promise.resolve();
    } catch (e) {
      console.log("Error in checkForActiveContracts() of EmploymentContractService", e);
      return Promise.reject(e);
    }
  }

  /**
   * sends contract approval/disapproval mail to all admins
   *
   * @param {*} [requestedData={}]
   * @returns
   * @memberof EmploymentContractService
   */
  async sendEmailToAdmins(requestedData = {}) {
    try {
      const { name, reason, loggedInUser, status, email } = requestedData;
      let approverAdmin = await this.adminUtilityInst.findOne({email: loggedInUser.email}, { email: 1, name:1 });
      if (loggedInUser.role === ROLE.ADMIN) {
        let admins = await this.adminUtilityInst.find({}, { email: 1, name });
        for (const admin of admins) {
          if (status === CONTRACT_STATUS.APPROVED) {
            await this.emailService.employmentContractApprovalAdmin({
              email: admin.email,
              admin: {
                name: approverAdmin.name,
                email: approverAdmin.email,
              },
              player: {
                name: name,
                email: email,
              }
            });
          }
          if (status === CONTRACT_STATUS.DISAPPROVED) {
            await this.emailService.employmentContractDisapprovalAdmin({
              email: admin.email,
              admin: {
                name: approverAdmin.name,
                email: approverAdmin.email,
              },
              player:{
                name: name,
                email:email
              },
              reason: reason,
            });
          }
        }
      }
      return Promise.resolve();
    } catch (e) {
      console.log("Error in sendEmailToAdmins() of EmploymentContractService", e);
      return Promise.reject(e);
    }
  }

}

module.exports = EmploymentContractService;
