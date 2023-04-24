import { Inject, Injectable, } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EventRepositoryInterface } from "../repositories/event/event.repository.interface";
import { ConectionRepositoryInterface } from "../conection-db/conection.repository,interface";
import { reminderEmail } from "../shared/email/reminderEmail";
import { NotificationsGateway } from "src/modules/notifications/notifications.gateway";
import { NotificationDto } from "src/modules/gateway/dto/notifications.dto";
import { UserRepositoryInterface } from "src/repositories/user/user.repository.interface";
import { ObjectId } from "mongodb";
import { isEmptyOrNullField } from "src/shared/shared-methods.util";
var momenttz = require('moment-timezone');
const crypto = require("crypto");
@Injectable()
export class TaksService {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
        @Inject('EventRepositoryInterface')
        private readonly eventRepository: EventRepositoryInterface,
        private readonly notificationGateway: NotificationsGateway,
        @Inject('UserRepositoryInterface')
        private readonly userRepository: UserRepositoryInterface,
    ) { }
    @Cron(CronExpression.EVERY_12_HOURS,{
        timeZone: 'America/Buenos_Aires'
    })
    async handleCron() {
        console.log('***********CRON EJECUTADO CADA 12 HS***********');
        const now_time = momenttz().tz("America/Buenos_Aires").format("HH:mm");
        const now_date = momenttz().tz("America/Buenos_Aires").format("YYYY-MM-DD");
        const tomorrow_date = momenttz().add(1,'days').tz("America/Buenos_Aires").format("YYYY-MM-DD");

        console.log(now_time);
        console.log(now_date);
        console.log(tomorrow_date)

        const db = await this.conectionRepository.conectionToDb();
        const eventCollection = db.collection('Events');
        const userCollection = db.collection('Users');

        const events = await this.eventRepository.getAllEvents(now_date, tomorrow_date, now_time, eventCollection);

        if(!events.length){
            console.log('No se encontraron eventos a los cuales enviar recordatorio.')
        };

        for(let event of events){
            const participantsInfo = await this.eventRepository.getEmailsParticipants(event._id, eventCollection);
            let participantsEmail: string[] = [];
            const participantsId: ObjectId[] = [];

            if(!isEmptyOrNullField(participantsInfo[0].guests_full)) participantsInfo[0].guests_full.forEach(participant => {
                participantsEmail.push(participant.email);
                participantsId.push(participant._id)
            });
            if(!isEmptyOrNullField(participantsInfo[0].organizers_full)) participantsInfo[0].organizers_full.forEach(participant => {
                participantsEmail.push(participant.email);
                participantsId.push(participant._id)
            });
            if(!isEmptyOrNullField(participantsInfo[0].services_full)) participantsInfo[0].services_full.forEach(participant => {
                participantsEmail.push(participant.email);
                participantsId.push(participant._id)
            });
            
            participantsId.push(participantsInfo[0].creator_full[0]._id);

            await reminderEmail(participantsInfo[0].creator_full[0].email, participantsEmail, event.title, event.start_date, event.start_time);

            const message = {
                notification_id: crypto.randomBytes(12).toString('hex'),
                message: `El evento ${event.title} está pronto a comenzar.`,
                seen: false,
                href: (event._id).toString()
            } as NotificationDto;

            for(let id of participantsId){
                await this.userRepository.addNotificationToUser(id, message, userCollection);
               }


            this.notificationGateway.handleEmailSent(message, participantsId);
        }
        console.log('***********Cron finalizado***********')
    }
}