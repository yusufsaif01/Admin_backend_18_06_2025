const MEMBER = require("../constants/MemberType");

module.exports = ({ email, name, member_type, reason, from_email }) => {
  let mappings = {
    [MEMBER.PLAYER]: require("./member-documents/disapproval/player"),
    [MEMBER.ACADEMY]: require("./member-documents/disapproval/academy"),
    [MEMBER.CLUB]: require("./member-documents/disapproval/club"),
  };

  if (mappings[member_type]) {
    return mappings[member_type]({
      email,
      name,
      member_type,
      reason,
      from_email,
    });
  }
};
