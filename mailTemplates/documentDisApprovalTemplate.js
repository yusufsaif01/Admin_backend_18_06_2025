const DOCUMENT_TYPE = require('../constants/DocumentType')
module.exports = ({ email, documentType, name, memberType, reason }) => {
  documentType = documentType === DOCUMENT_TYPE.AADHAR ? "Aadhaar" : (documentType.charAt(0).toUpperCase() + documentType.slice(1));
  return {
    to: email,
    subject: `${documentType} document details is disapproved`,
    // html: "",
    text: `${documentType} document details for ${name} has been disapproved by YFTChain due to "${reason}", Please update again.`,
  };
};