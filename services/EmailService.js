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
          // let details = await mailer.send({ to, subject, html, text });
          //fetch data from config file
          const connectionString = config.azureMailer.connection_String;
          const senderAddress = config.azureMailer.senderAddress;
    
          const POLLER_WAIT_TIME = 4;
    
          const message = {
            senderAddress: senderAddress,
            recipients: {
              to: [{ address: to }],
            },
            content: {
              subject: subject,
              plainText: text,
              html: html,
            },
          };
    
          try {
            const client = new EmailClient(connectionString);
    
            const poller = await client.beginSend(message);
    
            if (!poller.getOperationState().isStarted) {
              throw "Poller was not started.";
            }
    
            let timeElapsed = 0;
            while (!poller.isDone()) {
              poller.poll();
              console.log("Email send polling in progress");
    
              await new Promise((resolve) =>
                setTimeout(resolve, POLLER_WAIT_TIME * 1000)
              );
              timeElapsed += 10;
    
              if (timeElapsed > 18 * POLLER_WAIT_TIME) {
                throw "Polling timed out.";
              }
            }
    
            if (poller.getResult().status === KnownEmailSendStatus.Succeeded) {
              console.log(
                `Successfully sent the email (operation id: ${
                  poller.getResult().id
                })`
              );
            } else {
              console.log("in else error");
              throw poller.getResult().error;
            }
          } catch (ex) {
            console.log("in else catch ");
            console.error(ex);
          }
        } catch (err) {
          console.log("Error in sending mail", err);
          return Promise.resolve();
        }
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
