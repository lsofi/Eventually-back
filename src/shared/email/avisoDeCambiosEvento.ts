import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
var fs = require('fs');

require('dotenv').config();

export async function changeInEventReminder(change: string, change_description: string, event_creator: string, event_participants: string[]) {
    let transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: process.env.PORT_EMAIL,
        secure: true,
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.PASS_EMAIL
        },
    });

    transporter.verify(() => {
        console.log('Ready for send emails')
    });

    const filePath = path.join(__dirname, "/../../static/cambiosEvento.html");
    const source = fs.readFileSync(filePath, "utf8").toString();
    const template = handlebars.compile(source);
    const replacements = {
        CHANGE: change,
        CHANGE_DESCRIPTION: change_description,
    };
    const htmlToSend = template(replacements);
    const mailOptions = {
        from: process.env.USER,
        to: event_creator,
        cc: event_participants,
        subject: 'Confirmación de cambio de información del evento.',
        html: htmlToSend,
    }


    return transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return error;
        }
        return info.response;
    })
}