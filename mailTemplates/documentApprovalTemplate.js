module.exports = ({ email, documentType, name, memberType }) => {
  return {
    to: email,
    subject: "Your document details is verified",
    // html: "",
    text: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document details for ${name} has been approved successfully by YFTChain.`,
  };
};