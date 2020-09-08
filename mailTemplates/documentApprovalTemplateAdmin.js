const MEMBER = require("../constants/MemberType");

module.exports = ({ email, name, member_type, from_email }) => {
  let mappings = {
    [MEMBER.PLAYER]: require("./member-documents/approval/player"),
    [MEMBER.ACADEMY]: require("./member-documents/approval/academy"),
    [MEMBER.CLUB]: require("./member-documents/approval/club"),
  };
	name = name.charAt(0).toUpperCase() + name.slice(1)
  if (mappings[member_type]) {
    return mappings[member_type]({ email, name, member_type, from_email });
  }
};
