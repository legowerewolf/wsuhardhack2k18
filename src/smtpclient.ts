import { createTransport } from "nodemailer";


export class SMTPClient {
    transport: any;

    constructor(server: string, port: number, username: string, password: string) {
        this.transport = createTransport({
            host: server,
            port: port,
            secure: false,
            auth: {
                user: username,
                pass: password
            }
        });
        console.log(this.transport);
    }

    send(subject: string, plaintextContent?: string, htmlMessageContent?: string) {

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
            .then((messageResult: any) => {
                console.log(messageResult);
            })
    }
}