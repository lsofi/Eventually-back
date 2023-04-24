import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
var fs = require('fs');

require('dotenv').config();

export async function transportSubscription(username, mailTransportOwner, requestName, requestLastname, title, start_date, start_time){
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

    const filePath = path.join(__dirname, "/../../static/SolicitudTransporte.html");
    const source = fs.readFileSync(filePath, "utf8").toString();
    const template = handlebars.compile(source);
    const replacements = {
        username: username,
        creatorName: requestName,
        creatorLastname: requestLastname,
        title: title,
        start_date: start_date,
        start_time: start_time
    };
    const htmlToSend = template(replacements);
    
    const mailOptions = {
        from: process.env.USER,
        to: mailTransportOwner,
        subject: 'Solicitud de transporte.',
        html: htmlToSend
    };

    return transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return error;
        }
        return info.response;
    })    
}