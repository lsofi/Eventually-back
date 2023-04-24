import { BadRequestException, Inject } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { NotificationDto } from "src/modules/gateway/dto/notifications.dto";
import { NotificationsGateway } from "src/modules/notifications/notifications.gateway";
import { GuestRepositoryInterface } from "../../repositories/guest/guest.repository.interface";
import { UserRepositoryInterface } from "../../repositories/user/user.repository.interface";
import { sendEmail } from "../email/email";
import { isEmptyOrNullField } from "../shared-methods.util";
import { AddToEventStrategyInterface } from "./AddToEventStrategyInterface";
const crypto = require("crypto");

export class AddToEventByUsernameStrategy implements AddToEventStrategyInterface{
    constructor(
        @Inject('GuestRepositoryInterface')
        private readonly guestRepository: GuestRepositoryInterface,
        @Inject('UserRepositoryInterface')
        private readonly userRepository: UserRepositoryInterface,
        private readonly notificationGateway: NotificationsGateway
      ) { }

    async addToEvent(event, guest, user_id, userCollection, eventCollection) : Promise<boolean> {
        const existsUserName = await this.userRepository.findUserByUsername(guest.username, userCollection);

        if (isEmptyOrNullField(existsUserName)) throw new BadRequestException(['user#No se encontró el usuario ingresado']);
        else {
            if(event.guests?.length){
            const registerGuest = event.guests.find((x) => new ObjectId(existsUserName._id).equals(x.user_id));
            if(!isEmptyOrNullField(registerGuest)) throw new BadRequestException(['user#El invitado ya se encuentra registrado.'])
            }

            const eventCreator = await this.userRepository.findUserById(user_id, userCollection);

            await this.guestRepository.updateGuestInEvent(guest.event_id, eventCollection, existsUserName);
            await sendEmail(existsUserName.username, eventCreator.name, eventCreator.lastname,event.title, event.start_date, event.start_time, existsUserName.email, guest.event_id, existsUserName._id);
            
            const url = `/events/invitation?event_id=${guest.event_id}&user_id=${existsUserName._id}`;

            const message = {
              title: 'Has sido agregado a un evento.',
                notification_id: crypto.randomBytes(12).toString('hex'),
                message: `Te han invitado al evento '${event.title}'. Revisa tu casilla de correo para confirmar tu asistencia.`,
                seen: false,
                href: url
              } as NotificationDto;
      
              await this.userRepository.addNotificationToUser(existsUserName._id, message, userCollection);

              const participantsId = [existsUserName._id]
      
              this.notificationGateway.handleEmailSent(message, participantsId);
            return true;
        }
    }
}

