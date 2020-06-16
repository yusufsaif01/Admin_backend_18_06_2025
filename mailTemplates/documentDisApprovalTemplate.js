const MEMBER = require('../constants/MemberType')

module.exports = ({ email, name, member_type, reason }) => {
  let email_text = "";
  if (member_type === MEMBER.PLAYER) {
    email_text = `Aadhaar details for ${name} ${member_type} has been disapproved by YFTChain due to ${reason} reason, Please update again.`
  }
  if (member_type === MEMBER.ACADEMY) {
    email_text = `Document details for ${name} ${member_type} has been disapproved by YFTChain due to ${reason} reason, Please update again.`
  }
  if (member_type === MEMBER.CLUB) {
    email_text = `AIFF document details for ${name} ${member_type} has been disapproved by YFTChain due to ${reason} reason, Please update again.`
  }
  return {
    to: email,
    subject: "Document Disapproved",
    // html: "",
    text: email_text
  };
};