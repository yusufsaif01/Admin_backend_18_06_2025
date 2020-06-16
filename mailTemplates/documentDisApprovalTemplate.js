const DOCUMENT_TYPE = require('../constants/DocumentType')
const MEMBER = require('../constants/MemberType')

module.exports = ({ email, documentType, name, member_type, reason }) => {
  documentType = documentType === DOCUMENT_TYPE.AADHAR ? "Aadhaar" : (documentType.toUpperCase());
  let email_text = `${documentType} document details for ${name} ${member_type} has been disapproved by YFTChain due to ${reason} reason, Please update again.`
  let email_subject = `${documentType} document details is disapproved`;
  if (member_type === MEMBER.PLAYER) {
    email_text = `${documentType} details for ${name} ${member_type} has been disapproved by YFTChain due to ${reason} reason, Please update again.`
    email_subject = `${documentType} details is disapproved`
  }
  return {
    to: email,
    subject: email_subject,
    // html: "",
    text: email_text
  };
};