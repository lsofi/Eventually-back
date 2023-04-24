import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { isNotValidDate, isNotValidDate1GreatherDate2, isDateGreatherDateNow, isNullField, decodeJWT, isEmptyOrNullField, isEmptyObject } from '../../shared/shared-methods.util';
import { EventDto } from './dto/event.dto';
import { DeleteEventDto } from './dto/request/deleteEvent.dto';
import { UpdateEventDTO } from './dto/request/updateEvent.dto';
import { GetMyEventDTO } from './dto/response/getMyEvent.dto';
import { eventsByRole, HistorialEventosCreadosDto, InfoEventType } from './dto/response/historialEventoDto';
import { UserInEventDTO } from './dto/response/usersInEvent.dto';
import { EventServiceInterface } from './interface/event.interface';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { registerOrganizersDto } from './dto/request/registerOrganizers.dto';
import { DeleteOrganizerDto } from './dto/request/deleteOrganizer.dto';
import { isNotEmptyObject } from 'class-validator';
import { AddressDto } from './dto/address.dto';
import { Role } from '../../auth/roles/role.enum';
import { StateHistoryDto } from './dto/stateHistory.dto';
import { ChangeStateDto } from './dto/changeState.dto';
import { InvitationDto } from './dto/invitation.dto';
import { UpdatePermissionsRole } from '../../auth/dto/updatePermissionsRole.dto';
import { UpdatePermissionsParticipants } from '../../auth/dto/updatePermissionsParticipants.dto';
import { getEventToAddServiceDto } from './dto/response/getEventToAddService.dto';
import { CREATOR, GUEST, ORGANIZER, SERVICE, PUBLIC_GUEST } from '../../auth/dto/permissons';
import { TemplateDto } from './dto/template.dto';
import { TypeEventDto } from './dto/typeEvent.dto';
import { GetEventInfoDto } from './dto/response/getEventInfo.dto';
import * as moment from 'moment';
import { CreateEventDTO } from './dto/request/createEvent.dto';
import { PastHistorialEventsDTO } from './dto/response/historialEventPast.dto';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import { UserRepositoryInterface } from '../../repositories/user/user.repository.interface';
import { changeInEventReminder } from 'src/shared/email/avisoDeCambiosEvento';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationDto } from '../gateway/dto/notifications.dto';
var momenttz = require('moment-timezone');
require('dotenv').config();
const crypto = require("crypto");

@Injectable()
export class EventService implements EventServiceInterface {
  constructor(
    @Inject('ConectionRepositoryInterface')
    private readonly conectionRepository: ConectionRepositoryInterface,
    @Inject('EventRepositoryInterface')
    private readonly eventRepository: EventRepositoryInterface,
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    private readonly notificationGateway: NotificationsGateway
  ) { }

  async createEvent(event: CreateEventDTO, jwt: string): Promise<boolean> {
    this.haveInvalidFields(event);

    const user_id = decodeJWT(jwt).sub;
    event.creator = new ObjectId(user_id);

    const stateHistory = new StateHistoryDto('created', new Date(), null);

    event.state = 'created';
    event.state_history = [];
    event.state_history.push(stateHistory);

    event.CREATOR_PERMI = CREATOR;
    event.ORGANIZER_PERMI = ORGANIZER;
    event.GUEST_PERMI = GUEST;
    event.SERVICE_PERMI = SERVICE;
    event.PUBLIC_GUEST_PERMI = PUBLIC_GUEST;

    if (!isEmptyOrNullField(event.template)) event = {...event, ...event.template.event};

    delete event.template;

    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');
    const userCollection = db.collection('Users');

    const promises = [];

    let cantidadEventos = await this.eventRepository.countEventsByUserWhenIamCreator(user_id, collection);
    promises.push(cantidadEventos);

    let user = await this.userRepository.findUserById(user_id, userCollection);
    promises.push(user);

    const processedPromise = await Promise.allSettled(promises);

    if(processedPromise[0].status === 'fulfilled' && processedPromise[0].value) cantidadEventos = processedPromise[0].value;
    if(processedPromise[1].status === 'fulfilled' && processedPromise[1].value) user = processedPromise[1].value;

    if (cantidadEventos >= 2 && user.subscriptionType === 'basic') throw new BadRequestException(['premium#Debes ser usuario premium para tener más de dos eventos sin finalizar a la vez.']);
    if (event.type.is_private == false && user.subscriptionType === 'basic') throw new BadRequestException(['premium#Debes ser usuario premium para poder crear un evento público.']);
    
    return await this.eventRepository.createEvent(event, collection);
  }

  async deleteEvent(deleteEvent: DeleteEventDto, jwt: string): Promise<boolean> {
    const permissions = await this.getAllPermissionsInEvent(jwt, deleteEvent.event_id);
    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (permissions.role_permissions.DELETE_EVENT !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);

    const db = await this.conectionRepository.conectionToDb();
    const collectionEvents = db.collection('Events');
    const collectionUsers = db.collection('Users');
    const user_id = decodeJWT(jwt).sub;

    const isPasswordCreator = await this.userRepository.findUserById(user_id, collectionUsers);

    if ((await bcrypt.compare(deleteEvent.password, isPasswordCreator.password)) === false)
      throw new BadRequestException(['password#La contraseña ingresada es incorrecta.']);

    await this.eventRepository.deleteEvent(deleteEvent.event_id, collectionEvents);
    return true;
  }

  async getMyEvents(jwt: string): Promise<eventsByRole[]> {
    const user_id = decodeJWT(jwt).sub;
    const db = await this.conectionRepository.conectionToDb();
    const eventCollection = db.collection('Events');

    let eventsByRole: eventsByRole[] = [];
    let eventsCreatorFormated = [], eventsOrganizerFormated = [], eventsGuestFormated = [], eventsServicesFormated = [];
    const promises = [];

    const eventsCreator = this.eventRepository.getEventByUserAndEventIdWhenIamCreator(user_id, eventCollection);
    promises.push(eventsCreator);

    const eventsOrganizer = this.eventRepository.getEventByUserAndEventIdWhenImOrganizer(user_id, eventCollection);
    promises.push(eventsOrganizer);

    const eventsGuest = this.eventRepository.getEventByUserAndEventIdWhenImGuest(user_id, eventCollection);
    promises.push(eventsGuest);

    const eventsServices = this.eventRepository.getEventByUserAndEventIdWhenImProvider(user_id, eventCollection);
    promises.push(eventsServices);

    const processedPromise = await Promise.allSettled(promises);

    if(processedPromise[0].status === 'fulfilled' && processedPromise[0].value) eventsCreatorFormated = this.formatEvent(processedPromise[0].value, Role.CREATOR);
    if(processedPromise[1].status === 'fulfilled' && processedPromise[1].value) eventsOrganizerFormated = this.formatEvent(processedPromise[1].value, Role.ORGANIZER);
    if(processedPromise[2].status === 'fulfilled' && processedPromise[2].value) eventsGuestFormated = this.formatEvent(processedPromise[2].value, Role.GUEST);
    if(processedPromise[3].status === 'fulfilled' && processedPromise[3].value) eventsServicesFormated = this.formatEvent(processedPromise[3].value, Role.SERVICE);

    eventsByRole = eventsByRole.concat(eventsCreatorFormated, eventsOrganizerFormated, eventsGuestFormated, eventsServicesFormated);
    return eventsByRole;
  }

  private formatEvent(events: EventDto[], role): eventsByRole[] {
    let userEvents: eventsByRole[] = [];

    for (let event of events) {
      const eventType = {
        name: event.type.name,
        is_private: event.type.is_private,
      } as InfoEventType;

      const myEvent = {
        event_id: event._id,
        title: event.title,
        start_date: event.start_date,
        start_time: event.start_time,
        address_alias: event.address ? event.address.alias : '',
        photo: event.event_photo ? event.event_photo : null,
        type: eventType,
        state: event.state
      } as unknown as HistorialEventosCreadosDto;

      const eventByRole = {
        role: role,
        event: myEvent
      } as eventsByRole;

      userEvents.push(eventByRole);
    }

    return userEvents;
  }

  async getEvent(event_id:string, jwt:string): Promise<GetMyEventDTO> {
    const user_id = decodeJWT(jwt).sub;
    try{
      const db = await this.conectionRepository.conectionToDb();
      const eventCollection = db.collection('Events');
  
      const permissions = await this.getAllPermissionsInEvent(jwt, event_id);
  
      let event = await this.eventRepository.getEvent(event_id, permissions, user_id, eventCollection);
  
      event = event[0];
      event.role_permissions = permissions.role_permissions;
      if (event.activities && event.activities?.length > 0)
        event.activities.sort((a, b) => new Date(a.start_date + 'T' + a.start_time).getTime() - new Date(b.start_date + 'T' + b.start_time).getTime());
  
      return event;
    } catch(err){
      throw new BadRequestException(err);
    }
  }

  async updateEvent(jwt: string, updatedEvent: UpdateEventDTO): Promise<boolean> {
    const eventToUpdate = await this.getEvent(updatedEvent.event_id, jwt);
    if (isEmptyObject(eventToUpdate)) throw new BadRequestException(['generic#No se encuentra el evento a actualizar.']);
    if (isEmptyOrNullField(eventToUpdate.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (eventToUpdate.role_permissions.UPDATE_EVENT !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

    if (eventToUpdate.state == 'canceled' || eventToUpdate.state == 'finalized')
      throw new BadRequestException(['generic#No se puede modificar un evento que está ' + eventToUpdate.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
    
    const db = await this.conectionRepository.conectionToDb();
    const eventCollection = db.collection('Events');
    const userCollection = db.collection('Users');
    const participantsId: ObjectId[] = [];
    if (isEmptyOrNullField(updatedEvent.start_date))
    {
      updatedEvent.title = eventToUpdate.title;
      updatedEvent.start_date = eventToUpdate.start_date;
      updatedEvent.start_time = eventToUpdate.start_time;
      updatedEvent.end_date = eventToUpdate.end_date;
      updatedEvent.end_time = eventToUpdate.end_time;
      updatedEvent.description = eventToUpdate.description;
      updatedEvent.type = eventToUpdate.type;
    }
    else{
      this.haveInvalidFields(updatedEvent);

      let emailCreator: string;
      let participantsInfo;

      if(eventToUpdate.start_date !== updatedEvent.start_date){
        participantsInfo = await this.eventRepository.getEmailsParticipants(updatedEvent.event_id, eventCollection);
        
        const participantsEmail: string[] = [];

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
        
        emailCreator = participantsInfo[0].creator_full[0].email;
        participantsId.push(participantsInfo[0].creator_full[0]._id);

        const fecha = moment(updatedEvent.start_date).format('DD/MM/YYYY');
        const change = `la fecha de inicio del evento "${eventToUpdate.title}"`;
        const description = `de la fecha de inicio del evento. Ahora el evento se llevará a cabo el día "${fecha}" a las "${updatedEvent.start_time}".` 
        await changeInEventReminder(change, description, emailCreator, participantsEmail);
        
        // const message = {
        //   title: 'Modificación de evento.',
        //   notification_id: crypto.randomBytes(12).toString('hex'),
        //   message: `Se ha realizado una modificación en el evento '${eventToUpdate.title}'. Ahora se llevará a cabo el día '${fecha}' a las '${updatedEvent.start_time}'`,
        //   seen: false,
        //   href: updatedEvent.event_id
        // } as NotificationDto;

        // for(let id of participantsId){
        //  await this.userRepository.addNotificationToUser(id, message, userCollection);
        // }

        // this.notificationGateway.handleEmailSent(message, participantsId);
      }

      if(eventToUpdate.start_time !== updatedEvent.start_time){
        const participantsInfo =  await this.eventRepository.getEmailsParticipants(updatedEvent.event_id, eventCollection);
        
        const participantsEmail: string[] = [];

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
        
        emailCreator = participantsInfo[0].creator_full[0].email;
        participantsId.push(participantsInfo[0].creator_full[0]._id);

        const fecha = moment(updatedEvent.start_date).format('DD/MM/YYYY');
        const change = `la hora de inicio del evento "${eventToUpdate.title}"`;
        const description = `de la hora de inicio del evento. Ahora el evento se llevará a cabo el día "${fecha}" a las "${updatedEvent.start_time}".` 
        await changeInEventReminder(change, description, emailCreator, participantsEmail);

        // const message = {
        //   title: 'Modificación de evento.',
        //   notification_id: crypto.randomBytes(12).toString('hex'),
        //   message: `Se ha realizado una modificación en el evento '${eventToUpdate.title}'. Ahora se llevará a cabo el día '${fecha}' a las '${updatedEvent.start_time}'`,
        //   seen: false,
        //   href: updatedEvent.event_id
        // } as NotificationDto;

        // for(let id of participantsId){
        //  await this.userRepository.addNotificationToUser(id, message, userCollection);
        // }

        // this.notificationGateway.handleEmailSent(message, participantsId);
      }

      if((eventToUpdate.start_time !== updatedEvent.start_time) || (eventToUpdate.start_date !== updatedEvent.start_date)){
          const message = {
            title: 'Modificación de evento.',
            notification_id: crypto.randomBytes(12).toString('hex'),
            message: `Se ha realizado una modificación en el evento '${eventToUpdate.title}'`,
            seen: false,
            href: updatedEvent.event_id
          } as NotificationDto;

        for(let id of participantsId){
         await this.userRepository.addNotificationToUser(id, message, userCollection);
        }

        this.notificationGateway.handleEmailSent(message, participantsId);
      }
    }
    return await this.eventRepository.updateEvent(updatedEvent.event_id,updatedEvent, eventCollection);
  }

  private haveInvalidFields(event) {
    const start_date = event.start_date ? moment(event.start_date).format('YYYY-MM-DD') : null;
    const end_date = event.end_date ? moment(event.end_date).format('YYYY-MM-DD') : null;
    
    const start_time = event.start_time ? moment(event.start_time, "HH:mm").format("HH:mm") : null;
    const end_time = event.end_time ? moment(event.end_time, "HH:mm").format("HH:mm") : null;
    
    const now_time = momenttz().tz("America/Buenos_Aires").format("HH:mm");
    const now_date = momenttz().tz("America/Buenos_Aires").format("YYYY-MM-DD");


    if(start_date === now_date){
      if(start_time <= now_time) throw new BadRequestException(['start_time#La hora de inicio no puede ser menor a la hora actual.'])
    }

    if(start_date < now_date) throw new BadRequestException(['start_date#La fecha de inicio no puede ser menor a la fecha actual.']);

    if(!isEmptyOrNullField(end_date)){
      if(end_date < start_date) throw new BadRequestException(['end_date#La fecha de fin no puede ser menor a la fecha de inicio.']);
      
      if(start_date === end_date){
        if(!isEmptyOrNullField(start_time) && !isEmptyOrNullField(end_time) && (end_time <= start_time)) throw new BadRequestException(['end_time#La hora de finalización del evento no puede ser menor o igual a la hora de inicio.'])
      }
    }
  }

  private async getDataUserInEvent(user_id: string, userCollection): Promise<UserInEventDTO> {
    const user = await this.userRepository.findUserById(user_id, userCollection);
    const userInEvent = {
      user_id: user._id,
      name: user.name,
      lastname: user.lastname,
      username: user.username,
      profile_photo: user.small_photo,
      email: user.email,
    } as UserInEventDTO;
    return userInEvent;
  }

  async registerOrganizers(organizer: registerOrganizersDto, jwt: string): Promise<boolean> {
    const event = await this.getEvent(organizer.event_id, jwt);
    if (isEmptyOrNullField(event.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (event.role_permissions.REGISTER_ORGANIZER !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
    
    if (event.state == 'canceled' || event.state == 'finalized')
      throw new BadRequestException(['generic#No se puede agregar un organizador a un evento que está ' + event.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
    
    const db = await this.conectionRepository.conectionToDb();
    const userCollection = db.collection('Users');
    const eventCollection = db.collection('Events');

    if (!isEmptyOrNullField(organizer.username)) {
      const existsUserName = await this.userRepository.findUserByUsername(organizer.username, userCollection);
      if (isEmptyOrNullField(existsUserName)) throw new BadRequestException(['user#No se encontró el usuario ingresado']);

      if (!isEmptyOrNullField(event.organizers)) {
        if (new ObjectId(existsUserName._id).equals(event.creator.user_id)) throw new BadRequestException(['generic#El creador no puede ser organizador.']);

        const organizerRegister = event.organizers.find((x) => new ObjectId(existsUserName._id).equals(x.user_id));
        if (isNotEmptyObject(organizerRegister)) throw new BadRequestException(['generic#El organizador ya se encuentra registrado.'])
      }

      await this.eventRepository.updateOrganizerInEvent(organizer.event_id, eventCollection, existsUserName);
      return true;
    }

    if (!isEmptyOrNullField(organizer.email)) {
      const existsUserEmail = await this.userRepository.findUserByEmail(organizer.email, userCollection);
      if (isEmptyOrNullField(existsUserEmail)) throw new BadRequestException(['user#No se encontró el usuario ingresado']);

      if (!isEmptyOrNullField(event.organizers)) {
        if (new ObjectId(existsUserEmail._id).equals(event.creator.user_id)) throw new BadRequestException(['generic#El creador no puede ser organizador.']);

        const organizerRegister = event.organizers.find((x) => new ObjectId(existsUserEmail._id).equals(x.user_id));
        if (isNotEmptyObject(organizerRegister)) throw new BadRequestException(['generic#El organizador ya se encuentra registrado.'])
      }

      await this.eventRepository.updateOrganizerInEvent(organizer.event_id, eventCollection, existsUserEmail);
      return true;
    }
  }

  async deleteOrganizer(deleteOrganizer: DeleteOrganizerDto, jwt: string): Promise<boolean> {
    const permissions = await this.getAllPermissionsInEvent(jwt, deleteOrganizer.event_id);
    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede eliminar un organizador de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (permissions.role_permissions.DELETE_ORGANIZER !== true && permissions.role_permissions.REMOVE_ME_FROM_EVENT != true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
  
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    const promises = [];
    const deleteOrganizerInEvent = this.eventRepository.deleteOrganizer(deleteOrganizer.organizer_id, deleteOrganizer.event_id, collection);
    promises.push(deleteOrganizerInEvent);

    const deleteOrganizerInConsumables = this.eventRepository.deleteOrganizerInConsumables(deleteOrganizer.organizer_id, deleteOrganizer.event_id, collection);
    promises.push(deleteOrganizerInConsumables);

    const deleteOrganizerInExpenses = this.eventRepository.deleteOrganizerInExpenses(deleteOrganizer.organizer_id, deleteOrganizer.event_id, collection);
    promises.push(deleteOrganizerInExpenses);

    const deleteOrganizerInTransportSubscribers = this.eventRepository.deleteOrganizerInTransportSubscribers(deleteOrganizer.organizer_id, deleteOrganizer.event_id, collection);
    promises.push(deleteOrganizerInTransportSubscribers);

    const deleteOrganizerInTransportApplication = this.eventRepository.deleteOrganizerInTransportApplication(deleteOrganizer.organizer_id, deleteOrganizer.event_id, collection);
    promises.push(deleteOrganizerInTransportApplication);

    const deleteOrganizerInActivityInCharge = this.eventRepository.deleteOrganizerInActivityInCharge(deleteOrganizer.organizer_id, deleteOrganizer.event_id, collection);
    promises.push(deleteOrganizerInActivityInCharge);

    const processedPromise = await Promise.allSettled(promises);
    return true;
  }

  async getEventOrganizers(event_id: string, jwt:string){
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');
    
    return await this.eventRepository.getEventOrganizers(event_id, collection);
  }

  async getEventsHistorialWithFilters(jwt: string, role: string, name: string, dateFrom: string, dateTo: string, quiet: string): Promise<PastHistorialEventsDTO[]> {
    const db = await this.conectionRepository.conectionToDb();
    const eventCollection = db.collection('Events');

    const user_id = decodeJWT(jwt).sub;
    console.log(user_id)
    const quietBoolean = quiet === 'true' ? true : false;

    this.validateParamsEventHistorial(role, name, dateFrom, dateTo);

    let conditions = {};
    let and_clauses = [];

    if (!isEmptyOrNullField(role)) {
      if (role === 'creator') and_clauses.push({ creator: new ObjectId(user_id) });
      if (role === 'organizer') and_clauses.push({ "organizers.user_id": new ObjectId(user_id) } );
      if (role === 'guest') and_clauses.push({ guests: { user_id: new ObjectId(user_id), accepted: true } });

      if (!isEmptyOrNullField(name)) and_clauses.push({ title:  new RegExp(name, "i") });

      if (!isEmptyOrNullField(dateFrom)) and_clauses.push({ start_date: { $gte: dateFrom } });
      if (!isEmptyOrNullField(dateTo)) and_clauses.push({ start_date: { $lte: dateTo } });

      // if(!isEmptyOrNullField(dateTo)) and_clauses.push({ $or: [{end_date: {$lte: dateTo}}, {end_date: null }]});

      and_clauses.push({ $or: [{ state: 'canceled' }, { state: 'finalized' }] });

      if (and_clauses?.length > 0) conditions['$and'] = and_clauses;
      
      let events = await this.eventRepository.getEventWithConditions(conditions, eventCollection);
      if (events?.length === 0 && !quietBoolean) throw new BadRequestException(['warning#No se encontraron eventos con esa combinación de filtros.']);

      return this.formatEventHistorial(events);
    } else {
      let eventsByRole = [];
      const promises = [];
      let eventsCreatorFormated = [], eventsOrganizerFormated = [], eventsGuestFormated = [];

      const eventsCreator =  this.eventRepository.getPastEventByUserAndEventIdWhenIamCreator(user_id, eventCollection);
      promises.push(eventsCreator);

      const eventsOrganizer =  this.eventRepository.getPastEventByUserAndEventIdWhenImOrganizer(user_id, eventCollection);
      promises.push(eventsOrganizer);

      const eventsGuest =  this.eventRepository.getPastEventByUserAndEventIdWhenImGuest(user_id, eventCollection);
      promises.push(eventsGuest);

      const processedPromise = await Promise.allSettled(promises);

      if(processedPromise[0].status === 'fulfilled' && processedPromise[0].value) eventsCreatorFormated = this.formatEvent(processedPromise[0].value, Role.CREATOR);
      if(processedPromise[1].status === 'fulfilled' && processedPromise[1].value) eventsOrganizerFormated = this.formatEvent(processedPromise[1].value, Role.ORGANIZER);
      if(processedPromise[2].status === 'fulfilled' && processedPromise[2].value) eventsGuestFormated = this.formatEvent(processedPromise[2].value, Role.GUEST);
  
      eventsByRole = eventsByRole.concat(eventsCreatorFormated, eventsOrganizerFormated, eventsGuestFormated);      
      
      if (eventsByRole?.length === 0 && !quietBoolean) throw new BadRequestException(['warning#No se encontraron eventos con esa combinación de filtros.']);

      if (!isEmptyOrNullField(name))
        eventsByRole = eventsByRole.filter(x => x.title === name);

      if (!isEmptyOrNullField(dateFrom))
        eventsByRole = eventsByRole.filter(x => x.start_date >= dateFrom);

      if (!isEmptyOrNullField(dateTo))
        eventsByRole = eventsByRole.filter(x => x.end_date ?  x.end_date <= dateTo : x);

      if (eventsByRole?.length === 0 && !quietBoolean) throw new BadRequestException(['warning#No se encontraron eventos con esa combinación de filtros.']);

      return this.formatEventHistorial(eventsByRole);
    }
  }

  validateParamsEventHistorial(role: string, name: string, dateFrom: string, dateTo: string) {
    if (!isEmptyOrNullField(dateTo)) {
      if (isNotValidDate(dateTo)) throw new BadRequestException(['date_to#La fecha de inicio debe ser del formato aaaa-mm-dd']);
      // if (isDateGreatherDateNow(dateTo)) throw new BadRequestException(['date_to#La fecha hasta debe ser menor a la fecha actual']);
    }

    if (!isEmptyOrNullField(role)) {
      if (role !== Role.CREATOR && role !== Role.ORGANIZER && role !== Role.GUEST) throw new BadRequestException(['role#El rol ingresado no es válido.']);
    }

    if (!isEmptyOrNullField(name)) {
      if (name?.length > 50) throw new BadRequestException(['name#El nombre del evento no puede tener más de 50 caracteres.']);
    }

    if (!isEmptyOrNullField(dateFrom)) {
      if (isNotValidDate(dateFrom)) throw new BadRequestException(['date_from#La fecha desde debe ser del formato aaaa-mm-dd']);
    }

    if (!isEmptyOrNullField(dateFrom) && !isEmptyOrNullField(dateTo)) {
      if (isNotValidDate1GreatherDate2(dateTo, dateFrom)) throw new BadRequestException(['generic#La fecha hasta no puede ser menor a la fecha desde.'])
    }
  }

  private formatEventHistorial(events): PastHistorialEventsDTO[]{
    const eventsFormatted: PastHistorialEventsDTO[]  = [];
    for(let event of events){
      const eventType = {
        name: event.type.name,
        is_private: event.type.is_private,
      } as InfoEventType;

      const myEvent = {
        event_id: event._id,
        title: event.title,
        start_date: event.start_date,
        start_time: event.start_time,
        address_alias: event.address ? event.address.alias : '',
        photo: event.event_photo ? event.event_photo : null,
        type: eventType,
        state: event.state
      } as PastHistorialEventsDTO;

      eventsFormatted.push(myEvent);
    }
    return eventsFormatted;
  }

  async startEvent(changeState: ChangeStateDto, jwt): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');
    const userCollection = db.collection('Users');

    const event: EventDto = await this.eventRepository.getEventById(changeState.event_id, collection);

    if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento ingresado no existe.']);

    if (event.state == 'created' || event.state == 'delayed') {
      let lastStateHistory = event.state_history[event.state_history?.length - 1];
      lastStateHistory.end_date = new Date();

      const stateHistory = new StateHistoryDto('ongoing', new Date(), null);
      event.state_history.push(stateHistory);
      event.state = 'ongoing';

      const participantsInfo = await this.eventRepository.getEmailsParticipants(changeState.event_id, collection);
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

      await changeInEventReminder('estado del evento', `en el estado del evento. El evento "${participantsInfo[0].title}" ha comenzado.`, participantsInfo[0].creator_full[0].email, participantsEmail);
      
      const message = {
        title: 'Cambio en el estado del evento.',
        notification_id: crypto.randomBytes(12).toString('hex'),
        message: `El evento "${participantsInfo[0].title}" ha comenzado.`,
        seen: false,
        href: (changeState.event_id).toString()
      } as NotificationDto;

      for(let id of participantsId){
       await this.userRepository.addNotificationToUser(id, message, userCollection);
      }

      this.notificationGateway.handleEmailSent(message, participantsId);
      
      return await this.eventRepository.modifiedEventState(changeState.event_id, event, collection);
    }
    else throw new BadRequestException(['generic#No se puede iniciar el evento. El evento debe estar en organización o demorado.']);
  }

  async endEvent(changeState: ChangeStateDto, jwt:string): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');
    const userCollection = db.collection('Users');

    const event: EventDto = await this.eventRepository.getEventById(changeState.event_id, collection);

    if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento ingresado no existe.']);

    if (event.state == 'ongoing') {
      let lastStateHistory = event.state_history[event.state_history?.length - 1];
      lastStateHistory.end_date = new Date();

      const stateHistory = new StateHistoryDto('postEvent', new Date(), null);
      event.state_history.push(stateHistory);
      event.state = 'postEvent';

      const participantsInfo = await this.eventRepository.getEmailsParticipants(changeState.event_id, collection);
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

      await changeInEventReminder('estado del evento', `en el estado del evento. El evento "${participantsInfo[0].title}" ha terminado.`, participantsInfo[0].creator_full[0].email, participantsEmail);
      
      const message = {
        title: 'Cambio en el estado del evento.',
        notification_id: crypto.randomBytes(12).toString('hex'),
        message: `El evento "${participantsInfo[0].title}" ha terminado.`,
        seen: false,
        href: (changeState.event_id).toString()
      } as NotificationDto;

      for(let id of participantsId){
       await this.userRepository.addNotificationToUser(id, message, userCollection);
      }

      this.notificationGateway.handleEmailSent(message, participantsId);

      return await this.eventRepository.modifiedEventState(changeState.event_id, event, collection);
    }
    else throw new BadRequestException(['generic#No se puede finalizar el evento. El evento debe estar en curso.']);
  }

  async endPostEvent(changeState: ChangeStateDto): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    const event: EventDto = await this.eventRepository.getEventById(changeState.event_id, collection);

    if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento ingresado no existe.']);

    if (event.state == 'postEvent') {
      let lastStateHistory = event.state_history[event.state_history?.length - 1];
      lastStateHistory.end_date = new Date();

      const stateHistory = new StateHistoryDto('finalized', new Date(), null);
      event.state_history.push(stateHistory);
      event.state = 'finalized';

      return await this.eventRepository.modifiedEventState(changeState.event_id, event, collection);
    }
    else throw new BadRequestException(['generic#No se puede finalizar el post evento. El evento debe estar en post evento.']);
  }

  async delayEvent(changeState: ChangeStateDto, jwt): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');
    const userCollection = db.collection('Users');

    const event: EventDto = await this.eventRepository.getEventById(changeState.event_id, collection);

    if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento ingresado no existe.']);

    if (event.state == 'created') {
      let lastStateHistory = event.state_history[event.state_history?.length - 1];
      lastStateHistory.end_date = new Date();

      const stateHistory = new StateHistoryDto('delayed', new Date(), null);
      event.state_history.push(stateHistory);
      event.state = 'delayed';

      const participantsInfo = await this.eventRepository.getEmailsParticipants(changeState.event_id, collection);
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
      
      await changeInEventReminder('estado del evento', `en el estado del evento. El evento "${participantsInfo[0].title}" ha sido retrasado.`, participantsInfo[0].creator_full[0].email, participantsEmail);
      
      const message = {
        title: 'Cambio en el estado del evento.',
        notification_id: crypto.randomBytes(12).toString('hex'),
        message: `El evento "${participantsInfo[0].title}" ha sido retrasado.`,
        seen: false,
        href: (changeState.event_id).toString()
      } as NotificationDto;

      for(let id of participantsId){
       await this.userRepository.addNotificationToUser(id, message, userCollection);
      }

      this.notificationGateway.handleEmailSent(message, participantsId);

      return await this.eventRepository.modifiedEventState(changeState.event_id, event, collection);
    }
    else throw new BadRequestException(['generic#No se puede demorar el evento. El evento debe estar en organización.']);
  }

  async suspendEvent(changeState: ChangeStateDto, jwt): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');
    const userCollection = db.collection('Users');

    const event: EventDto = await this.eventRepository.getEventById(changeState.event_id, collection);

    if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento ingresado no existe.']);

    if (event.state == 'created' || event.state == 'ongoing' || event.state == 'delayed') {
      let lastStateHistory = event.state_history[event.state_history?.length - 1];
      lastStateHistory.end_date = new Date();

      const stateHistory = new StateHistoryDto('suspended', new Date(), null);
      event.state_history.push(stateHistory);
      event.state = 'suspended';

      const participantsInfo = await this.eventRepository.getEmailsParticipants(changeState.event_id, collection);
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
      
      await changeInEventReminder('estado del evento', `en el estado del evento. El evento "${participantsInfo[0].title}" ha sido suspendido.`, participantsInfo[0].creator_full[0].email, participantsEmail);
      
      const message = {
        title: 'Cambio en el estado del evento.',
        notification_id: crypto.randomBytes(12).toString('hex'),
        message: `El evento "${participantsInfo[0].title}" ha sido suspendido.`,
        seen: false,
        href: (changeState.event_id).toString()
      } as NotificationDto;

      for(let id of participantsId){
       await this.userRepository.addNotificationToUser(id, message, userCollection);
      }

      this.notificationGateway.handleEmailSent(message, participantsId);

      return await this.eventRepository.modifiedEventState(changeState.event_id, event, collection);
    }
    else throw new BadRequestException(['generic#No se puede suspender el evento. El evento debe estar en organización, en curso o demorado.']);
  }

  async cancelEvent(changeState: ChangeStateDto, jwt): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');
    const userCollection = db.collection('Users');
    
    const event: EventDto = await this.eventRepository.getEventById(changeState.event_id, collection);

    if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento ingresado no existe.']);

    if (event.state == 'created' || event.state == 'ongoing' || event.state == 'delayed' || event.state == 'suspended') {
      let lastStateHistory = event.state_history[event.state_history?.length - 1];
      lastStateHistory.end_date = new Date();

      const stateHistory = new StateHistoryDto('canceled', new Date(), null);
      event.state_history.push(stateHistory);
      event.state = 'canceled';

      const participantsInfo = await this.eventRepository.getEmailsParticipants(changeState.event_id, collection);
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

      await changeInEventReminder('estado del evento', `en el estado del evento. El evento "${participantsInfo[0].title}" ha sido cancelado.`, participantsInfo[0].creator_full[0].email, participantsEmail);
      
      const message = {
        title: 'Cambio en el estado del evento.',
        notification_id: crypto.randomBytes(12).toString('hex'),
        message: `El evento "${participantsInfo[0].title}" ha sido cancelado.`,
        seen: false,
        href: (changeState.event_id).toString()
      } as NotificationDto;

      for(let id of participantsId){
       await this.userRepository.addNotificationToUser(id, message, userCollection);
      }

      this.notificationGateway.handleEmailSent(message, participantsId);

      return await this.eventRepository.modifiedEventState(changeState.event_id, event, collection);
    }
    else throw new BadRequestException(['generic#No se puede cancelar el evento. El evento debe estar en organización, en curso, demorado o suspendido.']);
  }

  async resumeEvent(changeState: ChangeStateDto): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    const event: EventDto = await this.eventRepository.getEventById(changeState.event_id, collection);

    if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento ingresado no existe.']);

    if (event.state == 'suspended') {
      let lastStateHistory = event.state_history[event.state_history?.length - 1];
      lastStateHistory.end_date = new Date();

      const stateHistory = new StateHistoryDto('ongoing', new Date(), null);
      event.state_history.push(stateHistory);
      event.state = 'ongoing';

      return await this.eventRepository.modifiedEventState(changeState.event_id, event, collection);
    }
    else throw new BadRequestException(['generic#No se puede reanudar el evento. El evento debe estar suspendido.']);
  }

  async reorganizeEvent(changeState: ChangeStateDto): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    const event: EventDto = await this.eventRepository.getEventById(changeState.event_id, collection);

    if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento ingresado no existe.']);

    if (event.state == 'suspended') {
      let lastStateHistory = event.state_history[event.state_history?.length - 1];
      lastStateHistory.end_date = new Date();

      const stateHistory = new StateHistoryDto('created', new Date(), null);
      event.state_history.push(stateHistory);
      event.state = 'created';

      return await this.eventRepository.modifiedEventState(changeState.event_id, event, collection);
    }
    else throw new BadRequestException(['generic#No se puede reorganizar el evento. El evento debe estar suspendido.']);
  }

  async generateInvitationLink(jwt: string, event_id: string): Promise<string> {
    const permissions = await this.getAllPermissionsInEvent(jwt, event_id);
    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (permissions.role_permissions.GENERATE_INVITATION_LINK !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
    
    const creation_tmstp = (Math.floor(Date.now() / 1000)).toString();
    const timelimit = '172800'; //48hs
    
    const invitation_id_to_hash = `${creation_tmstp}${event_id}`;
    const saltOrRounds = 12;
    const pattern =  /[*@!#$%&/.]/gi;
    const invitation_id = await bcrypt.hash(invitation_id_to_hash, saltOrRounds);
    const invitation_id_posta = invitation_id.replace(pattern, '');
    
    const invitation = {
      invitation_id: invitation_id_posta,
      event_id: event_id,
      creation_tmstp: creation_tmstp,
      timelimit: timelimit
    } as InvitationDto;
    
    const db = await this.conectionRepository.conectionToDb();
    const collectionInvitations = db.collection('Invitations');

    const invitationToBD = await this.eventRepository.generateInvitationLink(invitation, collectionInvitations);
    if (invitationToBD.insertedCount === 0) return "";
    return (process.env.ENVIRONMENT === 'stg') ? process.env.INVITATION_LINK_STG + `${invitation_id_posta}` : process.env.INVITATION_LINK_PROD + `${invitation_id_posta}`
  }

  async getEventByHash(hash:string): Promise<string>{
    const db = await this.conectionRepository.conectionToDb();
    const collectionInvitations= db.collection('Invitations');

    const invitation = await this.eventRepository.findInvitationLInk(hash, collectionInvitations);

    if(isEmptyOrNullField(invitation)) throw new BadRequestException(['generic#No se encontró la invitación.'])

    const now = Math.floor(Date.now() / 1000);
    const timeDifference = now - parseFloat(invitation.creation_tmstp);
    if(timeDifference > parseFloat(invitation.timelimit)) throw new BadRequestException(['generic#Se pasó el tiempo limite para aceptar la invitación. Generar un nuevo link de invitación.']);

    return invitation.event_id;
  }

  async udpateRolePermissions(jwt: string, updatePermissionsDto: UpdatePermissionsRole): Promise<boolean> {
    const permissions = await this.getAllPermissionsInEvent(jwt, updatePermissionsDto.event_id);
    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    
    if (permissions.role_permissions.UPDATE_PERMISSIONS !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
    let rolePermissions;
    if (updatePermissionsDto.role === Role.ORGANIZER) rolePermissions = permissions.ORGANIZER;
    if (updatePermissionsDto.role === Role.GUEST) rolePermissions = permissions.GUEST;
    if(updatePermissionsDto.role === Role.SERVICE) rolePermissions = permissions.SERVICE;

    if (updatePermissionsDto.permissions?.length === 0) throw new BadRequestException(['generic#No se mandaron permisos para actualizar.'])
    for (let permission in updatePermissionsDto.permissions) {
      if (rolePermissions.hasOwnProperty(permission)) {
        Object.defineProperty(rolePermissions, permission, { value: updatePermissionsDto.permissions[permission] });
      }
    }
    
    const db = await this.conectionRepository.conectionToDb();
    const eventCollection = db.collection('Events');
    if (updatePermissionsDto.role === Role.ORGANIZER) return await this.eventRepository.updateOrganizerPermissions(rolePermissions, updatePermissionsDto.event_id, eventCollection);
    if (updatePermissionsDto.role === Role.GUEST) return await this.eventRepository.updateGuestPermissions(rolePermissions, updatePermissionsDto.event_id, eventCollection);
    if(updatePermissionsDto.role === Role.SERVICE) return await this.eventRepository.updateServicePermissions(rolePermissions, updatePermissionsDto.event_id, eventCollection);
  }

  async updateParticipantsPermissions(jwt: string, updatePermissionsDto: UpdatePermissionsParticipants): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const eventCollection = db.collection('Events');

    const event = await this.getEvent(updatePermissionsDto.event_id, jwt);
    if (isEmptyOrNullField(event.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (event.role_permissions.UPDATE_PERMISSIONS !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);

    if (updatePermissionsDto.permissions?.length === 0) throw new BadRequestException(['generic#No se mandaron permisos para actualizar.'])

    const guests = event.guests ? event.guests : [];
    if (guests?.length) {
      const guest = guests.find((x) => new ObjectId(updatePermissionsDto.user_id).equals(x.user_id));
      if (!isEmptyOrNullField(guest)) {
        const permissions = { ...guest.permissions, ...updatePermissionsDto.permissions };
        return await this.eventRepository.updateParticipantsPermissions(updatePermissionsDto.event_id, guest.user_id, permissions, eventCollection );
      }
    }

    const organizers = event.organizers ? event.organizers : [];
    if (organizers?.length) {
      const organizer = organizers.find((x) => new ObjectId(updatePermissionsDto.user_id).equals(x.user_id));
      if (!isEmptyOrNullField(organizer)) {
        const permissions = { ...organizer.permissions, ...updatePermissionsDto.permissions };
        const response = await eventCollection.updateOne(
          {
            _id: new ObjectId(updatePermissionsDto.event_id),
            'organizers.user_id': organizer.user_id
          },
          { $set: { 'organizers.$.permissions': permissions } }
        );
        if (response.modifiedCount === 0) return false;
        return true;
      }
    };
  }

  async getEventsToAddService(jwt: string): Promise<getEventToAddServiceDto[]> {
    const events: any = await this.getMyEvents(jwt);
    let eventsToAdd: getEventToAddServiceDto[] = [];

    for (const event of events) {
      const permissions = await this.getAllPermissionsInEvent(jwt, event.event.event_id);
      if(isEmptyOrNullField(permissions.role_permissions)) continue;
      if(permissions.role_permissions.ADD_SERVICE_TO_EVENT !== true) continue;

      const evento = {
        event_id: event.event.event_id,
        title: event.event.title,
        start_date: event.event.start_date ? event.event.start_date : '',
        start_time: event.event.start_time ? event.event.start_time : '',
        state: event.event.state
      } as getEventToAddServiceDto;

      eventsToAdd.push(evento);
      continue;
    }
    return eventsToAdd;
  }

  async getTemplates(): Promise<TemplateDto[]>{
    return await this.eventRepository.getTemplates();
  }

  async createTemplate(template: TemplateDto): Promise<boolean>{
    const db = await this.conectionRepository.conectionToDb();
    const templateCollection = db.collection('Templates');

    template.isOwn = false;

    return await this.eventRepository.createTemplates(template, templateCollection);
  }

  async getUserTemplates(jwt: string): Promise<TemplateDto[]>{
    const user_id = decodeJWT(jwt).sub;

    const db = await this.conectionRepository.conectionToDb();
    const userCollection = db.collection('Users');

    return await this.userRepository.getUserTemplates(user_id, userCollection);
  }

  async createTemplateByUser(template: TemplateDto, jwt: string): Promise<boolean>{
    const decodeJwt = decodeJWT(jwt);
    const user_id = decodeJwt.sub;
    const subscriptionType = decodeJwt.subscriptionType;
    
    if (subscriptionType === 'basic') throw new BadRequestException(['premium#Debes ser usuario premium para crear una plantilla personalizada.']);
    
    const db = await this.conectionRepository.conectionToDb();
    const userCollection = db.collection('Users');

    var crypto = require("crypto");
    template._id = crypto.randomBytes(12).toString('hex');
    template.isOwn = true;

    return await this.userRepository.createTemplateByUser(user_id, template, userCollection);
  }

  async getEventTypes(): Promise<TypeEventDto[]>{
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('EventTypes');

    const types = await this.eventRepository.getEventTypes(collection);

    types.sort((a, b) => this.sortByMaube(a,b));

    return types;
  }

  private sortByMaube(a , b){
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  }

  async getAllPermissionsInEvent(jwt: string, event_id: string) {
    const user_id = decodeJWT(jwt).sub;
    const db = await this.conectionRepository.conectionToDb();
    const eventCollection = db.collection('Events');

    const events = await this.eventRepository.getEventForPermissions(event_id, eventCollection);

    if (events?.length === 0) throw new BadRequestException(['generic#No se encontró el evento ingresado en la base de datos.']);

    let role_permissions;

    if(events[0].type.is_private === false) role_permissions = events[0].PUBLIC_GUEST_PERMI;
    
    if(events[0].services){
      const isProvider = events[0].services.find(x => x.provider.equals(user_id))
      if(!isEmptyOrNullField(isProvider)){
        if(isProvider.permissions){
          role_permissions = Object.assign(events[0].SERVICE_PERMI, isProvider.permissions);
        } else{
          role_permissions = events[0].SERVICE_PERMI;
        }
      }
    }

    let isGuest;
    if (events[0].guests) {
      for (let guest of events[0].guests) {
        if ((guest.user_id).equals(user_id)) isGuest = guest;
      }
    }


    if (!isEmptyOrNullField(isGuest)) {
      if (isGuest.permissions) {
        role_permissions = Object.assign(events[0].GUEST_PERMI, isGuest.permissions);
      } else {
        role_permissions = events[0].GUEST_PERMI;
      }
    }

    if (events[0].organizers) {
      const isOrganizer = events[0].organizers.find(x => new ObjectId(x.user_id).equals(user_id));
      if (!isEmptyOrNullField(isOrganizer)) {
        if (isOrganizer.permissions) {
          role_permissions = Object.assign(events[0].ORGANIZER_PERMI, isOrganizer.permissions);
        } else {
          role_permissions = events[0].ORGANIZER_PERMI;
        }
      }
    }

    const isCreator = new ObjectId(events[0].creator).equals(user_id);
    if (isCreator) role_permissions = events[0].CREATOR_PERMI;

    const permissionsInEvent = {
      CREATOR: events[0].CREATOR_PERMI,
      ORGANIZER: events[0].ORGANIZER_PERMI,
      GUEST: events[0].GUEST_PERMI,
      SERVICE: events[0].SERVICE_PERMI,
      role_permissions: role_permissions,
      state: events[0].state,
      creatorSubscriptionType: events[0].creatorSubscriptionType
    }

    return permissionsInEvent;
  }

  async getEventInfo(event_id: string): Promise<GetEventInfoDto> {
    const db = await this.conectionRepository.conectionToDb();
    const eventCollection = db.collection('Events');
    const event = await this.eventRepository.getEventById(event_id, eventCollection);

    if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento ingresado no se encuentra en la base de datos.']);

    let address;
    if (isEmptyOrNullField(event.address)) {
      address = null;
    } else {
      address = {
        alias: event.address.alias ? event.address.alias : null,
        city: event.address.city ? event.address.city : null,
        number: event.address.number ? event.address.number : null,
        street: event.address.street ? event.address.street : null
      } as AddressDto;
    }

    const userCollection = db.collection('Users');
    const creator = event.creator;
    const creatorWithData = await this.getDataUserInEvent(creator, userCollection);

    const evento = {
      title: event.title,
      start_date: event.start_date,
      start_time: event.start_time,
      end_date: event.end_date ? event.end_date : null,
      end_time: event.end_time ? event.end_time : null,
      description: event.description,
      address: address,
      creator: creatorWithData,
    } as GetEventInfoDto;

    return evento;
  }

  async getPublicEvents(ciudad: string, provincia: string, tipo: string, fecha: string, hora: string, nombre: string, skip, limit): Promise<any>{
    const db = await this.conectionRepository.conectionToDb();
    const eventCollection = db.collection('Events');

    let conditions = {};
    let and_clauses = [];

    if(!isEmptyOrNullField(ciudad)) and_clauses.push({'address.city': ciudad});

    if(!isEmptyOrNullField(provincia)) and_clauses.push({'address.province': provincia});

    if(!isEmptyOrNullField(tipo)) and_clauses.push({'type.name': tipo});

    if(!isEmptyOrNullField(fecha)) and_clauses.push({start_date: {'$gte': fecha}});

    if(!isEmptyOrNullField(hora)) and_clauses.push({start_time: {'$gte': hora}});

    if(!isEmptyOrNullField(nombre)) and_clauses.push({title: new RegExp(nombre, "i")});

    and_clauses.push({ $or: [{ state: 'created' }, { state: 'ongoing' }, { state: 'delayed' }] })
    and_clauses.push({ 'type.is_private': false})

    if (and_clauses?.length > 0) conditions['$and'] = and_clauses;

    const countEventsWithConditions = await this.eventRepository.countDocumentsWithConditions(conditions, eventCollection);
    
    const events = await this.eventRepository.getEventPaginated(conditions, eventCollection, Number(skip), Number(limit));

    let eventsFormatted: HistorialEventosCreadosDto[] = []
    
    if(events.length){
      for(let event of events){
        let eventType = {
          name: event.type.name,
          is_private: event.type.is_private
        } as InfoEventType;

        let eventFormatted = {
          event_id: event._id,
          title: event.title,
          start_date: event.start_date,
          start_time: event.start_time,
          address_alias: event.address?.alias ? event.address.alias : '',
          photo: event.event_photo ? event.event_photo : '',
          type: eventType,
          state: event.state
        } as HistorialEventosCreadosDto;

        eventsFormatted.push(eventFormatted);
      }
    }
    return {count: countEventsWithConditions, eventsFormatted}
  }
}
