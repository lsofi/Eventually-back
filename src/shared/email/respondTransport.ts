import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
var fs = require('fs');

require('dotenv').config();

export async function respondTransport(username, mail_solicitante, event_title, name, lastname, respuesta, mensaje){
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

    const filePath = path.join(__dirname, "/../../static/respuestaTransporte.html");
    const source = fs.readFileSync(filePath, "utf8").toString();
    const template = handlebars.compile(source);
    const replacements = {
        username: username,
        EVENT_TITLE: event_title,
        NAME: name,
        LASTNAME: lastname,
        RESPUESTA: respuesta,
        MENSAJE: mensaje
    };
    const htmlToSend = template(replacements);
    
    const mailOptions = {
        from: process.env.USER,
        to: mail_solicitante,
        subject: 'Respuesta a la solicitud de transporte.',
        html: htmlToSend
    };

    return transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return error;
        }
        return info.response;
    })    
}