module.exports = ({ email, name, member_type, from_email }) => {
  return {
    to: email,
    subject: `${name} Accreditation details approval confirmation`,
    html() {
      return `
      ${from_email}
      `;
    },
  };
};
