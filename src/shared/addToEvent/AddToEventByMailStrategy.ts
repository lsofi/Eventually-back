import { BadRequestException, Inject } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { NotificationDto } from "src/modules/gateway/dto/notifications.dto";
import { NotificationsGateway } from "src/modules/notifications/notifications.gateway";
import { GuestRepositoryInterface } from "../../repositories/guest/guest.repository.interface";
import { UserRepositoryInterface } from "../../repositories/user/user.repository.interface";
import { sendEmail } from "../email/email";
import { sendInvitationToUserNotRegister } from "../email/sendInvitationToUserNotRegister";
import { isEmptyOrNullField } from "../shared-methods.util";
import { AddToEventStrategyInterface } from "./AddToEventStrategyInterface";
const crypto = require("crypto");

export class AddToEventByMailStrategy implements AddToEventStrategyInterface{
    constructor(
        @Inject('GuestRepositoryInterface')
        private readonly guestRepository: GuestRepositoryInterface,
        @Inject('UserRepositoryInterface')
        private readonly userRepository: UserRepositoryInterface,
        private readonly notificationGateway: NotificationsGateway
      ) { }

  async addToEvent(event, guest, user_id, userCollection, eventCollection): Promise<boolean> {
    const existsUserEmail = await this.userRepository.findUserByEmail(guest.email, userCollection);

    const eventCreator = await this.userRepository.findUserById(user_id, userCollection);

    if (isEmptyOrNullField(existsUserEmail)) return this.inviteGuestNotRegister(eventCreator, guest.email, event)

    if (event.guests?.length) {
      const registerGuest = event.guests.find((x) => new ObjectId(existsUserEmail._id).equals(x.user_id));
      if (!isEmptyOrNullField(registerGuest)) throw new BadRequestException(['user#El invitado ya se encuentra registrado.'])
    }


    await this.guestRepository.updateGuestInEvent(guest.event_id, eventCollection, existsUserEmail);
    
    await sendEmail(existsUserEmail.username, eventCreator.name, eventCreator.lastname, event.title, event.start_date, event.start_time, existsUserEmail.email, guest.event_id, existsUserEmail._id);

    const url = `/events/invitation?event_id=${guest.event_id}&user_id=${existsUserEmail._id}`;
    const message = {
      title: 'Has sido agregado a un evento.',
      notification_id: crypto.randomBytes(12).toString('hex'),
      message: `Te han invitado al evento '${event.title}'. Revisa tu casilla de correo para confirmar tu asistencia.`,
      seen: false,
      href: url
    } as NotificationDto;

    await this.userRepository.addNotificationToUser(existsUserEmail._id, message, userCollection);

    const participantsId = [existsUserEmail._id]

    this.notificationGateway.handleEmailSent(message, participantsId);

    return true;
  }

    async inviteGuestNotRegister(infoCreator, guestEmail, infoEvent){
      await sendInvitationToUserNotRegister(infoCreator.name, infoCreator.lastname, infoEvent.title, infoEvent.start_date, infoEvent.start_time, guestEmail, infoEvent._id);
      return true;
    }
}

