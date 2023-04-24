import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
var fs = require('fs');

require('dotenv').config();

export async function subscriptionConfirmation(username, mail){
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

    const filePath = path.join(__dirname, "/../../static/confirmacionSuscripcion.html");
    const source = fs.readFileSync(filePath, "utf8").toString();
    const template = handlebars.compile(source);
    const replacements = {
        USERNAME: username
    };
    const htmlToSend = template(replacements);
    
    const mailOptions = {
        from: process.env.USER,
        to: mail,
        subject: 'Bienvenido a Eventually Premium!.',
        html: htmlToSend
    };

    return transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return error;
        }
        return info.response;
    })    
}