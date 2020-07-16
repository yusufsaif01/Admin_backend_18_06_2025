const Promise = require("bluebird");
const mailer = require('../mailer');
const mailTemplates = require('../mailTemplates');
const render = require("../mailTemplates/render");

class EmailService {
    
    async sendMail(mailTemplate, data) {
        try {
            let { to, subject, html, text } = mailTemplates[mailTemplate](data);

            if (html) {
              html = render(html, data);
            }
            
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

    async documentApprovalAdmin (data) {
        await this.sendMail("documentApprovalAdmin", data)
    }

    async documentDisApproval (data) {
        await this.sendMail("documentDisapproval", data);
    }
    async documentDisApprovalAdmin (data) {
        await this.sendMail("documentDisapprovalTemplateAdmin", data);
    }

    async employmentContractApproval (data) {
        await this.sendMail("employmentContractApproval", data)
    }
    async employmentContractApprovalAdmin (data) {
        await this.sendMail("employmentContractApprovalAdmin", data);
    }
        
    async employmentContractDisapproval (data) {
        await this.sendMail("employmentContractDisapproval", data)
    }
    async employmentContractDisapprovalAdmin (data) {
        await this.sendMail("employmentContractDisapprovalAdmin", data);
    }


}

module.exports = EmailService;
