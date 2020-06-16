const DOCUMENT_TYPE = require('../constants/DocumentType')
const MEMBER = require('../constants/MemberType')

module.exports = ({ email, documentType, name, member_type }) => {
  documentType = documentType === DOCUMENT_TYPE.AADHAR ? "Aadhaar" : (documentType.toUpperCase());
  let email_text = `${documentType} document details for ${name} ${member_type} has been approved successfully by YFTChain.`;
  let email_subject = `${documentType} document details is verified`
  if (member_type === MEMBER.PLAYER) {
    email_text = `${documentType} details for ${name} ${member_type} has been approved successfully by YFTChain.`
    email_subject = `${documentType} details is verified`
  }
  return {
    to: email,
    subject: email_subject,
    // html: "",
    text: email_text
  };
};