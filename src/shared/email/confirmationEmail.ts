import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
var fs = require('fs');

require('dotenv').config();

export async function confirmationEmail(change: string, change_description: string, userEmail: string, name: string) {
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

    const filePath = path.join(__dirname, "/../../static/templateConfirmationEmail.html");
    const source = fs.readFileSync(filePath, "utf8").toString();
    const template = handlebars.compile(source);
    const replacements = {
        CHANGE: change,
        NAME: name,
        CHANGE_DESCRIPTION: change_description
    };
    const htmlToSend = template(replacements);
    const mailOptions = {
        from: process.env.USER,
        to: userEmail,
        subject: 'Confirmación de cambio de datos del usuario',
        html: htmlToSend,
    }


    return transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return error;
        }
        return info.response;
    })
}