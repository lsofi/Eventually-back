import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
var fs = require('fs');
require('dotenv').config();
import * as path from 'path';

export async function sendEmailForgottenPassword(email:string, token: string){
    let transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: process.env.PORT_EMAIL,
        secure: true,
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.PASS_EMAIL
        },
    });

    transporter.verify( () => {
        console.log('Ready for send emails')
    });
    const filePath = path.join(__dirname, "/../../static/templateForgottenPassword.html");
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        email: email,
        response:(process.env.ENVIRONMENT === 'stg') ? process.env.FORGOTTEN_PASSWORD_URL_STG + `newPasswordToken=${token}` : process.env.FORGOTTEN_PASSWORD_URL_PROD + `newPasswordToken=${token}`
    };
    const htmlToSend = template(replacements);

    let mailOptions = {
        from: process.env.USER,
        to: email,
        subject: 'Recuperación de contraseña.',
        html: htmlToSend
    }

    return transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log('Message sent: %s', error);
            return error;
        }
        console.log('Message sent: %s', info.messageId);
    })
}