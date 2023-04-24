import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MessageRepositoryInterface } from '../repositories/message/message.repository.interface';
import { ConectionRepositoryInterface } from '../conection-db/conection.repository,interface';
import { CreateMessageDto, Message } from './dto/create-message.dto';
import { decodeJWT, isEmptyOrNullField } from '../shared/shared-methods.util';
import { UserRepositoryInterface } from '../repositories/user/user.repository.interface';
import { GetChatDto } from './dto/getChats.dtos';
import { ChatRoom, CreateChatRoom } from './dto/createRoom.dto';
import { ServiceRepositoryInterface } from '../repositories/service/service.repository.interface';
import { ObjectId } from 'mongodb';
import { EventChatRoom } from './dto/eventChatRoom.dto';
import { EventService } from 'src/modules/event/event.service';
import { GeneralGateway } from '../modules/gateway/general-gateway.gateway';
import { ModifyEventRoomDto } from './dto/modifiyEventRoom.dto';
import { NotificationDto } from '../modules/gateway/dto/notifications.dto';
var crypto = require("crypto");
import { Socket } from 'socket.io' 
import { DeleteMeFromRoomDTO } from './dto/deleteMeFromRoom.dto';
import { DeleteServiceChatDTO } from './dto/deleteServiceChat.dto';

@Injectable()
export class MessagesService {
  constructor(
    @Inject('ConectionRepositoryInterface')
    private readonly conectionRepository: ConectionRepositoryInterface,
    @Inject('MessageRepositoryInterface')
    private readonly messageRepository: MessageRepositoryInterface,
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('ServiceRepositoryInterface')
    private readonly serviceRepository: ServiceRepositoryInterface,
    private readonly eventService: EventService,
  ){}
  
  // private clients: Map<string, Socket> = new Map();
  
  // addClient(id: string, client: Socket){
  //   this.clients.set(id, client)
  // };
  
  // removeClient(id: string){
  //   this.clients.delete(id)
  // };

  // getClient(id: string): Socket {
  //   return this.clients.get(id);
  // }

  // getAllClients(): Socket[] {
  //   return Array.from(this.clients.values());
  // }

  async handleConnect(jwt:string):Promise<GetChatDto[]>{
    const user_id = decodeJWT(jwt).sub;
    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');

    const chats = await this.messageRepository.findRoomByUserId(user_id, messageCollection);

    const chatsFormatted: GetChatDto[] = [];
    if (!chats?.length) return chatsFormatted;
    for(let chat of chats){
      if(chat.receptor === user_id) {
        const chatFormatted = {
          name: chat.remitente_full_name,
          photo: chat.remitente_full_profile_photo,
          service_name: chat.receptor_full_name,
          notifications: 0,
          room_id: chat.room_id.toString()
        } as GetChatDto;
        chatsFormatted.push(chatFormatted);
      }

      if(chat.remitente === user_id) {
        const chatFormatted = {
          name: chat.receptor_full_name,
          service_name: chat.receptor_full_name,
          photo: chat.recetor_full_photo,
          notifications: 0,
          room_id: chat.room_id.toString()
        } as GetChatDto;
        chatsFormatted.push(chatFormatted);
      }
    }
    return chatsFormatted;
  }

  async createRoom(room: CreateChatRoom, token: string){
    const {service_id } = room;
    const user_id = decodeJWT(token).sub;

    const db = await this.conectionRepository.conectionToDb();
    const serviceCollection = db.collection('Services');
    const messageCollection = db.collection('Messages');

    const service = await this.serviceRepository.findServicesById(service_id, serviceCollection);

    if(isEmptyOrNullField(service)) throw new BadRequestException(['generic#El servicio no existe']);
    
    const roomByService = await this.messageRepository.findRoomByServiceId(service_id, user_id, messageCollection);
    
    if (!isEmptyOrNullField(roomByService)) throw new BadRequestException(['generic#Ya existe una sala de chat creada para el servicio seleccionado.']);

    
    const roomInBD = {
      service_id: new ObjectId(service._id),
      receptor: service.provider,
      remitente: new ObjectId(user_id),
      messages: []
    } as unknown as ChatRoom;

    await this.messageRepository.createChatRoom(roomInBD, messageCollection);
    
  }

  async createMessage(payload: CreateMessageDto){
    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');

    const room = await this.messageRepository.findRoom(payload.room, messageCollection); //preguntar si hace falta
    if(isEmptyOrNullField(room)) throw new BadRequestException(['generic#No se encontró sala.'])

    payload.message.message_id = crypto.randomBytes(12).toString('hex');
    await this.messageRepository.insertMessageIntoRoom(payload, messageCollection);
  }

  async joinRoom(room_id:string): Promise<Message[]>{
    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');

    const room = await this.messageRepository.findRoom(room_id, messageCollection); //preguntar si hace falta
    if(isEmptyOrNullField(room)) throw new BadRequestException(['generic#No se encontró sala.']);

    if(room.messages.length){

      const messages: Message[] = room.messages;

      messages.sort((x, y) => {
        return new Date(x.sentAt) < new Date(y.sentAt) ? 1 : -1
      });
      
      return messages;
    } 
    return room.message;
  }

  async createEventChatRoom(room: EventChatRoom, jwt: string){
    const { event_id, name, participants, room_photo} = room;

    const permissions = await this.eventService.getAllPermissionsInEvent(jwt, event_id);

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede agregar un chat a un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);

    if(permissions.role_permissions.CREATE_CHAT_ROOM_EVENT !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');

    const participantsObjectID = [];
    participants.forEach(x => participantsObjectID.push(new ObjectId(x)));

    const eventChatRoom = {
      receptor: new ObjectId(event_id),
      room_photo: room_photo ? room_photo : '',
      name: name,
      participants: participantsObjectID,
      messages: []
    };

    const room_id = await this.messageRepository.createEventChatRoom(eventChatRoom, messageCollection);

    const chatFormatted = {
      name: name,
      photo: room_photo ? room_photo : '',
      notifications: 0,
      room_id: room_id
    } as GetChatDto;

    return chatFormatted;
  }

  async findEventChatRooms(token:string, event_id:string):Promise<GetChatDto[]>{
    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');

    const user_id = decodeJWT(token).sub;
    
    const chats = await this.messageRepository.findEventChatRooms(event_id, user_id, messageCollection);

    if(!chats.length) return chats;

    const chatsFormatted: GetChatDto[] = [];

    for(let chat of chats){

      const chatFormatted = {
        name: chat.name,
        photo: chat.room_photo,
        notifications: 0,
        room_id: chat._id.toString(),
      } as GetChatDto;
      chatsFormatted.push(chatFormatted);
    }

    return chatsFormatted;
  }

  async modifyEventRoom(room: ModifyEventRoomDto, jwt: string){
    const user_id = decodeJWT(jwt).sub;

    const permissions = await this.eventService.getAllPermissionsInEvent(jwt, room.event_id);

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede agregar un chat a un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);

    if(permissions.role_permissions.UPDATE_EVENT_ROOM !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);


    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');

    const participantsObjectID = [];
    const participants = room.participants;

    room.participants.forEach(x => participantsObjectID.push(new ObjectId(x)));

    room.participants = participantsObjectID;

    await this.messageRepository.modifyEventRoom(room, messageCollection);

    const roomUpdated = await this.messageRepository.findRoom(room.room_id, messageCollection);

    

    const roomFormmatted = {
      name: roomUpdated.name,
      photo: roomUpdated.room_photo,
      room_id: roomUpdated._id.toString(),
      participants: participants
    }

    return roomFormmatted;
  }

  async getAllNotifications(jwt: string): Promise<NotificationDto[]>{
    const user_id = decodeJWT(jwt).sub;

    const db = await this.conectionRepository.conectionToDb();
    const userCollection = await db.collection('Users');

    const notifications = await this.messageRepository.getAllNotificationsByUser(user_id, userCollection);

    if(isEmptyOrNullField(notifications)) return [];

    const notificationFormatted: NotificationDto[] = [];

    for(let notification of notifications.notifications){
      const not = {
        title: notification.title,
        message: notification.message,
        seen: notification.seen,
        notification_id: notification.notification_id,
        href: notification.href ? notification.href : ''
      } as NotificationDto;
      notificationFormatted.push(not);
    }

    return notificationFormatted;
  }

  async deleteAllNotifications(jwt: string){
    const user_id = decodeJWT(jwt).sub;
    
    const db = await this.conectionRepository.conectionToDb();
    const userCollection = await db.collection('Users');
    
    await this.messageRepository.deleteAllUserNotifications(user_id, userCollection);
  }

  async readAllNotifications(jwt: string){
    const user_id = decodeJWT(jwt).sub;
    
    const db = await this.conectionRepository.conectionToDb();
    const userCollection = await db.collection('Users');

    await this.messageRepository.readAllUserNotifications(user_id, userCollection);
    
    return await this.getAllNotifications(jwt);
  }

  async deleteNotification(jwt: string, notification_id: string){
    const user_id = decodeJWT(jwt).sub;
    
    const db = await this.conectionRepository.conectionToDb();
    const userCollection = await db.collection('Users');

    await this.messageRepository.deleteNotification(user_id, notification_id, userCollection);

    return await this.getAllNotifications(jwt);
  }

  async readNotification(jwt: string, notification_id: string){
    const user_id = decodeJWT(jwt).sub;
    
    const db = await this.conectionRepository.conectionToDb();
    const userCollection = await db.collection('Users');

    await this.messageRepository.readNotification(user_id, notification_id, userCollection);

    return await this.getAllNotifications(jwt);
  }

  async deleteAllViewNotifications(jwt: string){
    const user_id = decodeJWT(jwt).sub;
    
    const db = await this.conectionRepository.conectionToDb();
    const userCollection = await db.collection('Users');
    
    const notifications = await this.messageRepository.getAllNotificationsByUser(user_id, userCollection);

    const notSeenNotifications = [];
    notifications.notifications.forEach((x) => {
      if (!x.seen) notSeenNotifications.push(x)
    })

    await this.messageRepository.deleteAllViewNotifications(user_id, notSeenNotifications ,userCollection);
    
    return await this.getAllNotifications(jwt);
  }

  async getRoomParticipants(room_id, jwt){
    const user_id = decodeJWT(jwt).sub;
    
    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');

    const participants = await this.messageRepository.getRoomParticipants(room_id, messageCollection);

    const participantsString = [];
    participants?.participants?.forEach(x => participantsString.push(x.toString()));

    return participantsString;
  }

  async getRoomParticipantsId(room_id){
    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');

    const participants = await this.messageRepository.getRoomParticipants(room_id, messageCollection);

    const participantsString = [];
    participants?.participants?.forEach(x => participantsString.push(x.toString()));

    return participantsString;
  }

  async deleteMeFromRoom(deleteMeFromRoom: DeleteMeFromRoomDTO, jwt){
    const user_id = decodeJWT(jwt).sub;
    
    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');

    return await this.messageRepository.deleteMeFromRoom(deleteMeFromRoom.room_id, user_id, messageCollection);
  }

  async deleteRoom(deleteRoom: DeleteMeFromRoomDTO, jwt){
    const permissions = await this.eventService.getAllPermissionsInEvent(jwt, deleteRoom.event_id);

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede agregar un chat a un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);

    if(permissions.role_permissions.DELETE_EVENT_ROOM !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');

    return await this.messageRepository.deleteRoom(deleteRoom.room_id, messageCollection);
  }

  async deleteServiceRoom(deleteServiceRoom:DeleteServiceChatDTO, jwt){
    const db = await this.conectionRepository.conectionToDb();
    const messageCollection = db.collection('Messages');
    return await this.messageRepository.deleteRoom(deleteServiceRoom.room_id, messageCollection)
  }
}
