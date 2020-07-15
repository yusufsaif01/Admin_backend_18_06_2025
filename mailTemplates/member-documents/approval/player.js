module.exports = ({ email, name, member_type, from_email }) => {
  return {
    to: email,
    subject: `${name} aadhaar approval confirmation`,
    html() {
      return `
        ${from_email}
      `;
    },
  };
};
