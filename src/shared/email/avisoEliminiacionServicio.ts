import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
var fs = require('fs');

require('dotenv').config();

export async function avisoEliminacionServicio(username: string, serviceProvider: string, event_title: string, service_name: string){
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

    const filePath = path.join(__dirname, "/../../static/avisoEliminacionServicios.html");
    const source = fs.readFileSync(filePath, "utf8").toString();
    const template = handlebars.compile(source);
    const replacements = {
        USERNAME: username,
        EVENT_TITLE: event_title,
        SERVICE_NAME: service_name
    };
    const htmlToSend = template(replacements);
    
    const mailOptions = {
        from: process.env.USER,
        to: serviceProvider,
        subject: 'Han eliminado tu servicio de un evento.',
        html: htmlToSend
    };

    return transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return error;
        }
        return info.response;
    })    
}
