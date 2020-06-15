const DOCUMENT_TYPE = require('../constants/DocumentType')
module.exports = ({ email, documentType, name, memberType }) => {
  documentType = documentType === DOCUMENT_TYPE.AADHAR ? "Aadhaar" : (documentType.charAt(0).toUpperCase() + documentType.slice(1));
  return {
    to: email,
    subject: `${documentType} document details is verified`,
    // html: "",
    text: `${documentType} document details for ${name} has been approved successfully by YFTChain.`,
  };
};