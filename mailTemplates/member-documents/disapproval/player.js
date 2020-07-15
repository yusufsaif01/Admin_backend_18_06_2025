module.exports = ({ email, name, member_type, reason, from_email }) => {
  return {
    to: email,
    subject: `${name} aadhaar disapproval`,
    html() {
      return `
        ${reason}
        ${from_email}
      `;
    },
  };
};
