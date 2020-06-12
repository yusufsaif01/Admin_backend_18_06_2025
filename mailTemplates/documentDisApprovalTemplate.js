module.exports = ({ email, documentType, name, memberType, reason }) => {
  return {
    to: email,
    subject: "Your document details is disapproved",
    // html: "",
    text: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document details for ${name} has been disapproved by YFTChain due to "${reason}", Please update again.`,
  };
};