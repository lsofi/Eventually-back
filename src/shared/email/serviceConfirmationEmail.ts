import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
var fs = require('fs');
require('dotenv').config();
import * as path from 'path';

export async function sentServiceConfirmationEmail(provider: string, eventTitle:string, eventStartDate:string, eventStartTime:string, contactEmail:string, dateService:string, timeService:string, event_id:string, service_id:string, service_name: string): Promise<boolean>{
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
    const filePath = path.join(__dirname, "/../../static/templateServiceConfirmation.html");
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
    NAME: provider,
    EVENT_TITLE: eventTitle,
    EVENT_START_DATE: eventStartDate,
    EVENT_START_TIME: eventStartTime,
    DATE_SERVICE: dateService,
    TIME_SERVICE: timeService,
    SERVICE_NAME: service_name,
    response:(process.env.ENVIRONMENT === 'stg') ? 
        process.env.RESPONSE_SERVICE_INVITATION_STG + `?event_id=${event_id}&service_id=${service_id}&date_service=${dateService}&time_service=${timeService}` 
        : 
        process.env.RESPONSE_SERVICE_INVITATION_PROD + `?event_id=${event_id}&service_id=${service_id}&date_service=${dateService}&time_service=${timeService}`
    };
    const htmlToSend = template(replacements);

    var mailOptions = {
        from: process.env.USER,
        to: contactEmail,
        subject: 'Confirmación de servicio a evento',
        html: htmlToSend,
    };

    return transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return error;
        }
        return info.response;
    })
}