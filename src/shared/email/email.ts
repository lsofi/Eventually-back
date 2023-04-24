import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
var fs = require('fs');
import * as path from 'path';

require('dotenv').config();

export async function sendEmail(guestUsername: string, creatorName: string, creatorLastname: string, eventTitle: string, event_start_date: string, event_start_time: string, guestEmail: string, event_id: string, user_id): Promise<boolean>{
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
    const filePath = path.join(__dirname, "/../../static/template.html");
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
    creatorName: creatorName,
    creatorLastname: creatorLastname,
    username: guestUsername,
    title: eventTitle,
    start_date: event_start_date,
    start_time: event_start_time,
    response: (process.env.ENVIRONMENT === 'stg') ? process.env.RESPONSE_INVITATION_URL_STG + `event_id=${event_id}&user_id=${user_id}` : process.env.RESPONSE_INVITATION_URL_PROD + `event_id=${event_id}&user_id=${user_id}`
    };
    const htmlToSend = template(replacements);

    var mailOptions = {
        from: process.env.USER,
        to: guestEmail,
        subject: 'Confirmación de asistencia a evento',
        html: htmlToSend,
    };

    return transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log (error);
        }
        return info.response;
    })
}