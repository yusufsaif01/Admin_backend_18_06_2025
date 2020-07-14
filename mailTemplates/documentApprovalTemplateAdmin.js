const MEMBER = require('../constants/MemberType')

module.exports = ({ email, name, member_type }) => {
  let email_text = "";
  if (member_type === MEMBER.PLAYER) {
    email_text = `Aadhaar details for ${name} ${member_type} has been approved successfully by YFTChain.`
  }
  if (member_type === MEMBER.ACADEMY) {
    email_text = `Document details for ${name} ${member_type} has been approved successfully by YFTChain.`
  }
  if (member_type === MEMBER.CLUB) {
    email_text = `AIFF document details for ${name} ${member_type} has been approved successfully by YFTChain.`
  }
  return {
    to: email,
    subject: "Document Approved",
    text: email_text
  };
};