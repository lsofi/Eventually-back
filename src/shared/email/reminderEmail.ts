import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
var fs = require('fs');

require('dotenv').config();

export async function reminderEmail(eventCreator, participants, eventTitle, startDate, startTime){
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

    const filePath = path.join(__dirname, "/../../static/recordatorioEvento.html");
    const source = fs.readFileSync(filePath, "utf8").toString();
    const template = handlebars.compile(source);
    const replacements = {
        EVENT_TITLE: eventTitle,
        START_DATE: startDate,
        START_TIME: startTime
    };
    const htmlToSend = template(replacements);
    
    const mailOptions = {
        from: process.env.USER,
        to: eventCreator,
        cc: participants,
        subject: 'Recordatorio de fecha de evento.',
        html: htmlToSend
    };

    return transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return error;
        }
        return info.response;
    })    
}
