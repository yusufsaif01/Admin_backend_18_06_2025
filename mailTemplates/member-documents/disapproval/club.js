module.exports = ({ email, name, member_type, reason, from_email }) => {
  return {
    to: email,
    subject: `${name} document details disapproval`,
    html() {
      return `
      ${reason}
      ${from_email}
      `;
    },
  };
};
