const PlayerUtility = require("../db/utilities/PlayerUtility");
const errors = require("../errors");
const ResponseMessage = require("../constants/ResponseMessage");
const ProfileStatus = require("../constants/ProfileStatus");
const DocumentStatus = require("../constants/DocumentStatus");
const LoginUtility = require("../db/utilities/LoginUtility");
const EmailService = require("./EmailService");
const AdminUtility = require("../db/utilities/AdminUtility");
const MEMBER = require("../constants/MemberType");
const { PLAYER } = require("../constants/MemberType");
const PLAYER_TYPE = require("../constants/PlayerType");
const EmploymentContractUtility = require("../db/utilities/EmploymentContractUtility");
const CONTRACT_STATUS = require("../constants/ContractStatus");

class PlayerDocumentsService {
  constructor() {
    this.playerDetailsInst = new PlayerUtility();
    this.loginDetailsInst = new LoginUtility();
    this.emailService = new EmailService();
    this.adminInst = new AdminUtility();
    this.employmentContractUtilityInst = new EmploymentContractUtility();
  }

  async getUserDocuments(user_id) {
    let user = await this.getUser(user_id);

    return user;
  }

  async getUser(user_id) {
    let user = await this.playerDetailsInst.findOne({
      user_id: user_id,
    });
    if (!user) {
      throw new errors.NotFound(ResponseMessage.USER_NOT_FOUND);
    }
    return user;
  }

  async updateDocumentStatus(user_id, type, status, remarks) {
    let user = await this.getUser(user_id);

    if (status == DocumentStatus.APPROVED) {
      await this.approvalHandler(user, type);
      return Promise.resolve();
    }
    if (status == DocumentStatus.DISAPPROVED) {
      await this.disapproveHandler(user, type, remarks);
      return Promise.resolve();
    }
  }

  async approvalHandler(user, type) {
    const $where = {
      user_id: user.user_id,
      documents: {
        $elemMatch: {
          type: type,
        },
      },
    };
    let res = await this.playerDetailsInst.updateOne($where, {
      $set: {
        "documents.$.status": DocumentStatus.APPROVED,
        "documents.$.remark": "",
      },
    });

    if (res.nModified) {
      // document approval
      this.documentApprovalNotification(user);

      // profile approval
      await this.updateProfileStatus(user)

      // send profile approved notification
      // await this.emailService.profileVerified(user.email);
    }
  }

  async documentApprovalNotification(user) {
    const emailPayload = {
      email: user.email,
      name: [user.first_name, user.last_name].join(" "),
      member_type: MEMBER.PLAYER
    };
    // user
    this.emailService.documentApproval(emailPayload);

    // send the same notification to all registered admins.
    let admins = await this.getAdmins();
    admins.map((admin) => {
      emailPayload.email = admin.email;
      this.emailService.documentApprovalAdmin(emailPayload);
    });
  }

  async getAdmins() {
    return await this.adminInst.find(
      {},
      {
        email: 1,
      }
    );
  }

  async disapproveHandler(user, type, remarks) {
    const $where = {
      user_id: user.user_id,
      documents: {
        $elemMatch: {
          type: type,
        },
      },
    };
    let res = await this.playerDetailsInst.updateOne($where, {
      $set: {
        "documents.$.status": DocumentStatus.DISAPPROVED,
        "documents.$.remark": remarks,
      },
    });
    if (res.nModified) {
      /**
       * Send email notification
       */
      this.documentDisApprovalNotification(user, remarks);

      /**
       * Update profile status
       * 1. find existing verified user
       * 2. change status
       *
       * if the user is already disapproved, modified documents will be zero,
       * avoiding sending emails multiple times.
       */
      let updated = await this.loginDetailsInst.updateOne(
        {
          user_id: user.user_id,
          "profile_status.status": ProfileStatus.VERIFIED,
        },
        {
          $set: {
            profile_status: {
              status: ProfileStatus.NON_VERIFIED,
              remarks,
            },
          },
        }
      );

      if (updated.nModified) {
        // send email for profile disapproval.
        // await this.emailService.profileDisapproved(user.email, remarks);
      }
    }
  }

  async documentDisApprovalNotification(user, remarks) {
    const emailPayload = {
      email: user.email,
      name: [user.first_name, user.last_name].join(" "),
      reason: remarks,
      member_type: MEMBER.PLAYER
    };

    // user notification
    this.emailService.documentDisApproval(emailPayload);

    // send the same notification to all registered admins.
    let admins = await this.getAdmins();
    admins.map((admin) => {
      emailPayload.email = admin.email;
      this.emailService.documentDisApproval(emailPayload);
    });
  }

  async updateProfileStatus(user) {
    let profile_status = ProfileStatus.NON_VERIFIED;
    if (user.player_type === PLAYER_TYPE.PROFESSIONAL) {
      let condition = {
        is_deleted: false,
        $and: [{ $or: [{ sent_by: user.user_id }, { send_to: user.user_id }] },
        { $or: [{ status: CONTRACT_STATUS.ACTIVE }, { status: CONTRACT_STATUS.YET_TO_START }, { status: CONTRACT_STATUS.COMPLETED }] }]
      };
      let foundContract = await this.employmentContractUtilityInst.findOne(condition);
      if (foundContract) {
        profile_status = ProfileStatus.VERIFIED;
      }
    }
    else {
      profile_status = ProfileStatus.VERIFIED;
    }
    await this.loginDetailsInst.updateOne({ user_id: user.user_id, }, { "profile_status.status": profile_status });
  }
}

module.exports = PlayerDocumentsService;
