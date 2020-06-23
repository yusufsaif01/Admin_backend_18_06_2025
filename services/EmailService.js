const Promise = require("bluebird");
const mailer = require('../mailer');
const mailTemplates = require('../mailTemplates');

class EmailService {
    
    async sendMail(mailTemplate, data) {
        try {
            let { to, subject, html, text } = mailTemplates[mailTemplate](data);
            let details = await mailer.send({ to, subject, html, text });
            return details;
        } catch (err) {
            console.log("Error in sending mail", err);
            return Promise.resolve();
        }
    }

    async profileVerified (email) {
        await this.sendMail("profileVerified", {email: email});
    }
    async profileDisapproved (email, remarks) {
        await this.sendMail("profileDisapproved", {email: email, remarks});
    }

    async documentApproval (data) {
        await this.sendMail("documentApproval", data)
    }

    async documentDisApproval (data) {
        await this.sendMail("documentDisapproval", data);
    }

    async employmentContractApproval (data) {
        await this.sendMail("employmentContractApproval", data)
    }
        
    async employmentContractDisapproval (data) {
        await this.sendMail("employmentContractDisapproval", data)
    }


}

module.exports = EmailService;
