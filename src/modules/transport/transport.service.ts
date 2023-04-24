import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { TransportServiceInterface } from './interface/transport.interface';
import { TransportDto } from './dto/transport.dto';
import { decodeJWT, isEmptyOrNullField, isNullField } from '../../shared/shared-methods.util';
import { ObjectId } from 'mongodb';
import { DeleteTransportDto } from './dto/request/deleteTransport.dto';
import { SubscribeToTransportDto } from './dto/request/subscribeToTransport.dto';
import { UnSubscribeToTransportDto } from './dto/request/unsubscribeToTransport.dto';
import { AnswerApplicationSubscriberDto } from './dto/request/answerApplicationSubscriber.dto';
import { respondTransport } from '../../shared/email/respondTransport';
import { transportSubscription } from '../../shared/email/transportSubscription';
import { UserRepositoryInterface } from '../../repositories/user/user.repository.interface';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import * as moment from 'moment';
const crypto = require("crypto");
import { NotificationDto } from '../gateway/dto/notifications.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
var momenttz = require('moment-timezone');

@Injectable()
export class TransportService implements TransportServiceInterface {
    constructor(
      @Inject('ConectionRepositoryInterface')
      private readonly conectionRepository: ConectionRepositoryInterface,
      private readonly eventServiceInterface: EventService,
      @Inject('UserRepositoryInterface')
      private readonly userRepositoryInterface: UserRepositoryInterface,
      @Inject('EventRepositoryInterface')
      private readonly eventRepositoryInterface: EventRepositoryInterface,
      private readonly notificationGateway: NotificationsGateway
    ) { }
    
    async createTransport(transport: TransportDto, jwt: string): Promise<boolean> {
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      const promises = [];

      let permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, transport.event_id);
      promises.push(permissions);

      let transports = await this.eventRepositoryInterface.getEventTransports(transport.event_id, collection);
      promises.push(transports);

      const processedPromise = await Promise.allSettled(promises);

      if(processedPromise[0].status === 'fulfilled' && processedPromise[0].value) permissions = processedPromise[0].value;
      if(processedPromise[1].status === 'fulfilled' && processedPromise[1].value) transports = processedPromise[1].value;

      if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede agregar un transporte a un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
      
      if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if(permissions.role_permissions.CREATE_TRANSPORT !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);
      
      if (transports?.transports?.length >= 2 && permissions.creatorSubscriptionType === 'basic') throw new BadRequestException(['premium#El evento debe ser premium para poder crear más de dos medios de transporte.']);
      
      const start_date = transport.start_date ? moment(transport.start_date).format('YYYY-MM-DD') : null;
      const start_time = transport.start_time ? moment(transport.start_time, "HH:mm").format("HH:mm") : null;

      const now_time = momenttz().tz("America/Buenos_Aires").format("HH:mm");
      const now_date = momenttz().tz("America/Buenos_Aires").format("YYYY-MM-DD");

      if(start_date < now_date) throw new BadRequestException(['start_date#La fecha de inicio no puede ser menor a la fecha actual.']);

      if(start_date === now_date){
        if(start_time <= now_time) throw new BadRequestException(['start_time#La hora de inicio no puede ser menor a la hora actual.'])
      }

      var crypto = require("crypto");
      transport.transport_id = crypto.randomBytes(12).toString('hex');
      
      const user_id = decodeJWT(jwt).sub;
      transport.in_charge = new ObjectId(user_id);
      
      return await this.eventRepositoryInterface.createTransport(transport.event_id, transport, collection);
    }

    async deleteTransport(deleteTransport: DeleteTransportDto, jwt: string): Promise<boolean> {
      const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, deleteTransport.event_id );
  
      if (permissions.state == 'canceled' || permissions.state == 'finalized')
        throw new BadRequestException(['generic#No se puede eliminar un transporte de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
  
      if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if (permissions.role_permissions.DELETE_TRANSPORT !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
   
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');
  
      return await this.eventRepositoryInterface.deleteTransport(deleteTransport.event_id, deleteTransport.transport_id, collection);
    }

    async updateTransport(updateTransport: TransportDto, jwt: string) : Promise<boolean>{
      const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt,updateTransport.event_id);
      if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if (permissions.role_permissions.UPDATE_TRANSPORT !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.'])
  
      if (permissions.state == 'canceled' || permissions.state == 'finalized')
        throw new BadRequestException(['generic#No se puede modificar un transporte de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
      
      const user_id = decodeJWT(jwt).sub;
      updateTransport.in_charge = new ObjectId(user_id);

      const start_date = updateTransport.start_date ? moment(updateTransport.start_date).format('YYYY-MM-DD') : null;
      const start_time = updateTransport.start_time ? moment(updateTransport.start_time, "HH:mm").format("HH:mm") : null;

      const now_time = momenttz().tz("America/Buenos_Aires").format("HH:mm");
      const now_date = momenttz().tz("America/Buenos_Aires").format("YYYY-MM-DD");

      if(start_date < now_date) throw new BadRequestException(['start_date#La fecha de inicio no puede ser menor a la fecha actual.']);

      if(start_date === now_date){
        if(start_time <= now_time) throw new BadRequestException(['start_time#La hora de inicio no puede ser menor a la hora actual.'])
      }
      
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');
  
      return await this.eventRepositoryInterface.updateTransport(updateTransport.event_id, updateTransport, updateTransport.transport_id, collection);
    }

    async getTransport(event_id: string, transport_id: string, jwt: string): Promise<TransportDto> {
        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Events');

        const user_id = decodeJWT(jwt).sub;

        return await this.eventRepositoryInterface.getTransport(event_id, transport_id, user_id, collection);
    }

    async subscribeToTransport(subscribeToTransport: SubscribeToTransportDto, jwt: string): Promise<boolean>{
        const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, subscribeToTransport.event_id);
        if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if(permissions.role_permissions.SUBSCRIBE_TO_TRANSPORT !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
        
        if (permissions.state == 'canceled' || permissions.state == 'finalized')
          throw new BadRequestException(['generic#No se puede suscribirse a un transporte de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
        
        const transport = await this.getTransport(subscribeToTransport.event_id, subscribeToTransport.transport_id, jwt);

        const user_id = decodeJWT(jwt).sub;
        let application;
    
        if (transport){
          if (transport.applications?.length > 0) {
            application = transport.applications.find((x) => new ObjectId(user_id).equals(x.user_id));
            if (!isNullField(application)) throw new BadRequestException(['generic#El usuario ingresado ya ha solicitado suscribirse al transporte.']);
          }
        }
        else{
          throw new BadRequestException(['generic#El transporte ingresado no existe.']);
        }
    
        application = {};
        application.user_id = new ObjectId(subscribeToTransport.user_id);
        application.address = subscribeToTransport.address;
        application.message = subscribeToTransport.message;

        const db = await this.conectionRepository.conectionToDb();
        const eventCollection = db.collection('Events');
        const userCollection = db.collection('Users');

        const info_mail = await this.eventRepositoryInterface.infoMailAnswerApplicationSubscriber(subscribeToTransport.event_id, transport.in_charge.user_id, user_id, eventCollection);

        await transportSubscription(info_mail.in_charge.username, info_mail.in_charge.email, info_mail.subscriber.name, info_mail.subscriber.lastname,
                                    info_mail.event_title, info_mail.start_date, info_mail.start_time);

        const message = {
          title: 'Te ha llegado una solicitud de transporte.',
          notification_id: crypto.randomBytes(12).toString('hex'),
          message: `'${info_mail.subscriber.name} ${info_mail.subscriber.lastname}' solicitó suscribirse a tu transporte en el evento '${info_mail.event_title}'`,
          seen: false,
          href: subscribeToTransport.event_id
        } as NotificationDto;
  
        await this.userRepositoryInterface.addNotificationToUser(transport.in_charge.user_id, message, userCollection);

        const participantsId = [new ObjectId(transport.in_charge.user_id)];

        this.notificationGateway.handleEmailSent(message, participantsId);
    
        return await this.eventRepositoryInterface.subscribeToTransport(subscribeToTransport.event_id, subscribeToTransport.transport_id, application, eventCollection); 
    }
      
    async unsubscribeToTransport(unsubscribeToTransport: UnSubscribeToTransportDto, jwt: string): Promise<boolean>{
      const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, unsubscribeToTransport.event_id);
      if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if(permissions.role_permissions.UNSUBSCRIBE_TO_TRANSPORT !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
      
      if (permissions.state == 'canceled' || permissions.state == 'finalized')
        throw new BadRequestException(['generic#No se puede desuscribir a un transporte de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
      
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');
      
      const user_id_jwt = decodeJWT(jwt).sub;

      const user_id = unsubscribeToTransport.user_id != user_id_jwt ? unsubscribeToTransport.user_id : user_id_jwt;
  
      return await this.eventRepositoryInterface.unsubscribeToTransport(unsubscribeToTransport.event_id, unsubscribeToTransport.transport_id, user_id, collection);
    }

    async answerApplicationSubscriber(answerApplicationSubscriber: AnswerApplicationSubscriberDto, jwt: string): Promise<boolean>{
      const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, answerApplicationSubscriber.event_id);
      if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if(permissions.role_permissions.ACCEPT_SUBSCRIBER_TO_TRANSPORT !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
      
      if (permissions.state == 'canceled' || permissions.state == 'finalized')
        throw new BadRequestException(['generic#No se puede responder una solicitud a un transporte de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
      
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');
      const userCollection = db.collection('Users');
      const user_id = decodeJWT(jwt).sub;

      const info_mail = await this.eventRepositoryInterface.infoMailAnswerApplicationSubscriber(answerApplicationSubscriber.event_id, user_id, answerApplicationSubscriber.subscriber_user_id, collection);

      if (answerApplicationSubscriber.accept == true){
        const result = await this.eventRepositoryInterface.acceptTransportApplication(answerApplicationSubscriber.event_id, answerApplicationSubscriber.transport_id, answerApplicationSubscriber.subscriber_user_id, answerApplicationSubscriber.subscriber_address, collection);
        
        if(result == false) return false;
        
        await respondTransport( info_mail.subscriber.username, info_mail.subscriber.email, info_mail.event_title, 
                                info_mail.in_charge.name, info_mail.in_charge.lastname, "aceptó", answerApplicationSubscriber.message);

        const message = {
          title: 'Han aceptado tu solicitud de transporte.',
          notification_id: crypto.randomBytes(12).toString('hex'),
          message: `'${info_mail.in_charge.name} ${info_mail.in_charge.lastname}' aceptó tu solicitud de transporte en el evento '${info_mail.event_title}'`,
          seen: false,
          href: answerApplicationSubscriber.event_id
        } as NotificationDto;
  
        await this.userRepositoryInterface.addNotificationToUser(answerApplicationSubscriber.subscriber_user_id, message, userCollection);

        const participantsId = [new ObjectId(answerApplicationSubscriber.subscriber_user_id)];

        this.notificationGateway.handleEmailSent(message, participantsId);

        return true;
      }
      else{
        const result = await this.eventRepositoryInterface.rejectTransportApplication(answerApplicationSubscriber.event_id, answerApplicationSubscriber.transport_id, answerApplicationSubscriber.subscriber_user_id, collection);
        
        if(result == false) return false;

        await respondTransport( info_mail.subscriber.username, info_mail.subscriber.email, info_mail.event_title, 
                                info_mail.in_charge.name, info_mail.in_charge.lastname, "rechazó", answerApplicationSubscriber.message);
        
        const message = {
          title: 'Han rechazado tu solicitud de transporte.',
          notification_id: crypto.randomBytes(12).toString('hex'),
          message: `'${info_mail.in_charge.name} ${info_mail.in_charge.lastname}' rechazó tu solicitud de transporte en el evento '${info_mail.event_title}'`,
          seen: false,
          href: answerApplicationSubscriber.event_id
        } as NotificationDto;
  
        await this.userRepositoryInterface.addNotificationToUser(answerApplicationSubscriber.subscriber_user_id, message, userCollection);

        const participantsId = [new ObjectId(answerApplicationSubscriber.subscriber_user_id)];

        this.notificationGateway.handleEmailSent(message, participantsId);

        return true;
      }
    }

    async getEventTransports(event_id: string, jwt:string): Promise<TransportDto[]> {    
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');
      
      return await this.eventRepositoryInterface.getEventTransports(event_id, collection);
    }
}
