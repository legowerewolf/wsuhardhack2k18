"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = require("nodemailer");
class SMTPClient {
    constructor(server, port, username, password) {
        this.transport = nodemailer_1.createTransport({
            host: server,
            port: port,
            secure: false,
            auth: {
                user: username,
                pass: password
            }
        });
    }
    send(subject, plaintextContent, htmlMessageContent) {
        plaintextContent = plaintextContent ? plaintextContent : '';
        htmlMessageContent = htmlMessageContent ? htmlMessageContent : `<div>${plaintextContent}</div>`;
        this.transport
            .verify()
            .then(() => {
            let message = {
                to: this.transport.options.auth.user,
                subject: subject,
                text: plaintextContent,
                html: htmlMessageContent
            };
            return this.transport.sendMail(message);
        })
            .then((messageResult) => {
            //console.log(messageResult);
        }, (error) => {
            console.log(error);
        });
    }
}
exports.SMTPClient = SMTPClient;
