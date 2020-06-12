const DOCUMENT_TYPE = require('../constants/DocumentType')
module.exports = ({ email, documentType, name, memberType }) => {
  documentType = documentType === DOCUMENT_TYPE.AADHAR ? "aadhaar" : documentType;
  return {
    to: email,
    subject: "Your document details is verified",
    // html: "",
    text: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document details for ${name} has been approved successfully by YFTChain.`,
  };
};