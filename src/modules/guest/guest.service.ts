import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { UserRepositoryInterface } from '../../repositories/user/user.repository.interface';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { decodeJWT, isEmptyOrNullField } from '../../shared/shared-methods.util';
import { EventService } from '../event/event.service';
import { GuestDto } from './dto/guest.dto';
import { DeleteGuestDto } from './dto/request/deleteGuest.dto';
import { registerGuestsDto } from './dto/request/registerGuest.dto';
import { RespondInvitationDTO } from './dto/request/respondInvitation.dto';
import { GuestServiceInterface } from './interfaces/guest.interface';
import { GuestRepositoryInterface } from '../../repositories/guest/guest.repository.interface';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import { AddToEventByUsernameStrategy } from '../../shared/addToEvent/AddToEventByUsernameStrategy';
import { AddToEventByMailStrategy } from '../../shared/addToEvent/AddToEventByMailStrategy';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class GuestService implements GuestServiceInterface {
  constructor(
    @Inject('ConectionRepositoryInterface')
    private readonly conectionRepository: ConectionRepositoryInterface,
    private readonly eventServiceInterface: EventService,
    @Inject('EventRepositoryInterface')
    private readonly eventRepository: EventRepositoryInterface,
    @Inject('GuestRepositoryInterface')
    private readonly guestRepository: GuestRepositoryInterface,
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    private readonly notificationGateway: NotificationsGateway
  ) { }

  async registerGuest(guest: registerGuestsDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, guest.event_id);
    
    if (permissions.state != 'created' && permissions.state != 'ongoing' && permissions.state != 'delayed')
    throw new BadRequestException(['user#No se puede agregar un invitado en el estado actual del evento.']);
    
    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if(permissions.role_permissions.REGISTER_GUEST !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);
    
    const db = await this.conectionRepository.conectionToDb();
    const userCollection = db.collection('Users');
    const eventCollection = db.collection('Events');
    
    const user_id = decodeJWT(jwt).sub;

    const event = await this.eventServiceInterface.getEvent(guest.event_id, jwt);

    if (!isEmptyOrNullField(guest.username)) {
      const addToEvent = new AddToEventByUsernameStrategy(this.guestRepository, this.userRepository, this.notificationGateway);
      return addToEvent.addToEvent(event, guest, user_id, userCollection, eventCollection);
    }

    if (!isEmptyOrNullField(guest.email)) {
      const addToEvent = new AddToEventByMailStrategy(this.guestRepository, this.userRepository, this.notificationGateway);
      return addToEvent.addToEvent(event, guest, user_id, userCollection, eventCollection);
    }

    throw new BadRequestException(['user#Por favor ingrese el nombre de usuario o email del invitado.']);
  }



  async deleteGuest(deleteGuest: DeleteGuestDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, deleteGuest.event_id);

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede eliminar un invitado de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if(permissions.role_permissions.DELETE_GUEST !== true && permissions.role_permissions.REMOVE_ME_FROM_EVENT != true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    const promises = [];
    const deleteGuestInEvent = this.guestRepository.deleteGuest(deleteGuest.event_id, deleteGuest.guest_id, collection);
    promises.push(deleteGuestInEvent);

    const deleteGuestInConsumables = this.guestRepository.deleteGuestInConsumables(deleteGuest.event_id, deleteGuest.guest_id, collection);
    promises.push(deleteGuestInConsumables);

    const deleteGuestInExpenses = this.guestRepository.deleteGuestInExpenses(deleteGuest.event_id, deleteGuest.guest_id, collection);
    promises.push(deleteGuestInExpenses);

    const deleteGuestInTransportSubscribers = this.guestRepository.deleteGuestInTransportSubscribers(deleteGuest.event_id, deleteGuest.guest_id, collection);
    promises.push(deleteGuestInTransportSubscribers);

    const deleteGuestInTransportApplication = this.guestRepository.deleteGuestInTransportApplication(deleteGuest.event_id, deleteGuest.guest_id, collection);
    promises.push(deleteGuestInTransportApplication);

    const deleteGuestInActivityInCharge = this.guestRepository.deleteGuestInActivityInCharge(deleteGuest.event_id, deleteGuest.guest_id, collection);
    promises.push(deleteGuestInActivityInCharge);

    const processedPromise = await Promise.allSettled(promises);
    return true;
  }

  async getGuests(event_id: string): Promise<GuestDto[]> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.guestRepository.getGuests(event_id, collection);
  }

  async respondInvitation(respondInvitation: RespondInvitationDTO, jwt:string) {
    const db = await this.conectionRepository.conectionToDb();
    const eventCollection = db.collection('Events');

    if(respondInvitation.email) return await this.respondInvitationByEmail(respondInvitation, jwt, eventCollection);

    let  event_id_link;
    if(respondInvitation.invitation_hash) event_id_link = await this.getEventIdByLink(respondInvitation, db);

    const event_id = event_id_link ? event_id_link : respondInvitation.event_id;
    const {accepted} = respondInvitation;

    const event = await this.eventRepository.getEventById(event_id, eventCollection);

    if(isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento no existe.']);

    const user_id = event_id_link ? decodeJWT(jwt).sub : respondInvitation.user_id;

    const existsGuest = event.guests?.find((x) => new ObjectId(user_id).equals(x.user_id) && x.accepted !== null);
    if(existsGuest) throw new BadRequestException(['generic#Ya contestaste la invitación.'])

    if(respondInvitation.invitation_hash) return this.guestRepository.respondInvitationByLink(eventCollection, event_id, user_id, accepted)

    return this.guestRepository.respondInvitationByMail(eventCollection, event_id, user_id, accepted)
  }

  async respondInvitationByEmail(respondInvitation: RespondInvitationDTO, jwt: string, eventCollection){
    const {accepted, event_id} = respondInvitation;
    const user_id = decodeJWT(jwt).sub;

    const event = await this.eventRepository.getEventById(event_id, eventCollection);

    if(isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento no existe.']);

    const existsGuest = event.guests?.find((x) => new ObjectId(user_id).equals(x.user_id) && x.accepted !== null);
    if(existsGuest) throw new BadRequestException(['generic#Ya contestaste la invitación.'])

    return this.guestRepository.updateGuestInEventWhenUserWasNotRegister(event_id, eventCollection, user_id, accepted)
  }

  async getEventIdByLink(respondInvitation: RespondInvitationDTO, db){
    const {invitation_hash} = respondInvitation;
    const collectionInvitations= db.collection('Invitations');

    try{
      const invitation = await this.guestRepository.getEventByLink(invitation_hash, collectionInvitations);
      if(invitation?.length === 0) throw new BadRequestException(['generic#No se encontró la invitación.'])

      const now = Math.floor(Date.now() / 1000);
      const timeDifference = now - parseFloat(invitation[0].creation_tmstp);
      if(timeDifference > parseFloat(invitation[0].timelimit)) throw new BadRequestException(['generic#Se pasó el tiempo limite para aceptar la invitación. Generar un nuevo link de invitación.']);

      return invitation[0].event_id;

    } catch(err){
      throw new BadRequestException(err);
    }
  }

}
