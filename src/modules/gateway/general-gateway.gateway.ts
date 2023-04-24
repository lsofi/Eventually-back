import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io' 
import { ObjectId } from 'mongodb';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { MessagesService } from '../../messages/messages.service';
import { GetChatDto } from 'src/messages/dto/getChats.dtos';
import { decodeJWT } from 'src/shared/shared-methods.util';
import { EventChatRoom } from 'src/messages/dto/eventChatRoom.dto';
import { ModifyEventRoomDto } from 'src/messages/dto/modifiyEventRoom.dto';
import { DeleteMeFromRoomDTO } from 'src/messages/dto/deleteMeFromRoom.dto';
const momenttz = require('moment-timezone');

@WebSocketGateway(4443, {
  cors: {
    origin: '*'
  }
})
export class GeneralGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  constructor(
    private readonly messageService: MessagesService
  ){};
  
  private connectedUsers = new Set<Map<string, string>>();

  @WebSocketServer()
  server: Server;
  
  afterInit(token: string,) {
    console.log('Esto se ejecuta cuando inicia el socket') 
  }

  createUserMap(client: Socket, user_jwt: string): Map<string, string> {
    const userMap = new Map()
    userMap.set('client_id', client.id);
    userMap.set('user_id', decodeJWT(user_jwt).sub)
    return userMap;
  }

  async handleConnection(client: Socket) {
    client.setMaxListeners(20); 
    console.log('Esto se ejecuta cuando alguien se conecta al socket general.')    
    const user_jwt = client.handshake.auth.token;
    const userMap = this.createUserMap(client, user_jwt)
    if (!this.connectedUsers.has(userMap)) this.connectedUsers.add(userMap);

    if(client.handshake.auth.event_id){
      const eventRooms = await this.messageService.findEventChatRooms(user_jwt, client.handshake.auth.event_id);
      client.emit('rooms', eventRooms);
      client.join(`event_${client.handshake.auth.event_id}`)
    }

    if(client.handshake.auth.notifications){
      console.log('todas las notificaciones pa')

      const notifications = await this.messageService.getAllNotifications(user_jwt);
      client.emit('notificationsAll', notifications);
    } 

    if(!client.handshake.auth.event_id && !client.handshake.auth.notifications){
      const serviceRooms = await this.messageService.handleConnect(user_jwt);
      client.emit('rooms', serviceRooms)
    }
  }

  handleDisconnect(client: Socket) {
    console.log('alguien se fue :(')
    const user_jwt = client.handshake.auth.token;
    const userMap = this.createUserMap(client, user_jwt);
    this.connectedUsers.delete(userMap);
  }

  /**
   * SERVICES
   */

  @SubscribeMessage('createMessageService')
  async handleIncomingMessage(client: Socket, payload: CreateMessageDto){
    const {room, message} = payload;
    payload.message.sentAt = momenttz().tz("America/Buenos_Aires").format("DD/MM/YY HH:mm");
    payload.message.sender = new ObjectId(payload.message.sender);
    
    await this.messageService.createMessage(payload);
    this.server.to(`room_${room}`).emit(`new_message`, message);
  }

  @SubscribeMessage('leaveChat')
  handleRoomLeave(client: Socket, room:string){
    console.log(`bye_room_${room}`);
    client.leave(`room_${room}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, room_id: string){
    console.log(`room_${room_id}`);

    client.join(`room_${room_id}`);
    const messages = await this.messageService.joinRoom(room_id);
    client.emit('get_messages', messages)
  }

  /**
   * EVENTS
   */
  @SubscribeMessage('createMessageInEventChatRoom')
  async handleIncomingEventMessage(client: Socket, payload: CreateMessageDto){
    const {room, message} = payload;
    payload.message.sentAt = momenttz().tz("America/Buenos_Aires").format("DD/MM/YY HH:mm");
    payload.message.sender = new ObjectId(payload.message.sender);
    
    await this.messageService.createMessage(payload);
    this.server.to(`room_${room}`).emit(`new_message`, message);
  }

  @SubscribeMessage('leaveEventChatRoom')
  handleRoomEventLeave(client: Socket, room:string){
    console.log(`bye_room_${room}`);
    client.leave(`room_${room}`);
  }

  @SubscribeMessage('joinEventChatRoom')
  async handleJoinEventRoom(client: Socket, room_id: string){
    console.log(`room_${room_id}`);

    client.join(`room_${room_id}`);
    const messages = await this.messageService.joinRoom(room_id);
    client.emit('get_messages', messages)
  }

  @SubscribeMessage('eventRoomCreated')
  handleEventRoomCreated(payload: GetChatDto, room: EventChatRoom){
    const participants = room.participants;
    let socket: Socket;
    this.connectedUsers.forEach(userMap => {
      if (!participants.includes(userMap.get('user_id'))) return;
      socket = this.server.sockets.sockets.get(userMap.get('client_id'));
      if (socket) socket.emit('newRoom', payload);
    })
  }

  @SubscribeMessage('eventRoomUpdated')
  async handleEventRoomUpdated( room: ModifyEventRoomDto) {
    const participants = room.participants;
    const updatedRoom = {
        room_id: room.room_id,
        photo: room.room_photo,
        name: room.name,
        notifications: 0
    }
    let socket: Socket;
    this.connectedUsers.forEach(userMap => {
      socket = this.server.sockets.sockets.get(userMap.get('client_id'));
      if (socket){
        if (participants.toString().includes(userMap.get('user_id'))) {
          socket.emit('roomUpdated', updatedRoom);
        }
        else{
          socket.emit('roomDeleted', updatedRoom);
        }
      }
    })
  }

  @SubscribeMessage('eventRoomDeleted')
  async handleDeleteRoom( room){
    const participants = await this.messageService.getRoomParticipantsId(room.room_id);
    let socket: Socket;
    this.connectedUsers.forEach(userMap => {
      socket = this.server.sockets.sockets.get(userMap.get('client_id'));
      if (socket){
        if (participants.includes(userMap.get('user_id'))) {
          socket.emit('roomDeletedId', room.room_id);
        }
      }
    })
  }

  /**
   * NOTIFICATIONS
   */

  @SubscribeMessage('deleteAllNotifications')
  async handleDeleteAllNotifications(client: Socket){
    const user_jwt = client.handshake.auth.token;

    await this.messageService.deleteAllNotifications(user_jwt);
    client.emit('notificationsAll', [])
  }

  @SubscribeMessage('readAllNotifications')
  async handleReadAllNotifications(client: Socket){
    const user_jwt = client.handshake.auth.token;
    
    const notifications = await this.messageService.readAllNotifications(user_jwt);
    client.emit('notificationsAll', notifications)
  }

  @SubscribeMessage('deleteNotification')
  async handleDeleteNotifications(client: Socket, notification_id: string){
    const user_jwt = client.handshake.auth.token;
    
    const notifications = await this.messageService.deleteNotification(user_jwt, notification_id);
    client.emit('notificationsAll', notifications)
  }

  @SubscribeMessage('readNotification')
  async handleReadNotification(client: Socket, notification_id: string){
    const user_jwt = client.handshake.auth.token;
    
    const notifications = await this.messageService.readNotification(user_jwt, notification_id);
    client.emit('notificationsAll', notifications)
  }

  @SubscribeMessage('deleteAllViewNotifications')
  async handleDeleteAllViewNotifications(client: Socket){
    const user_jwt = client.handshake.auth.token;

    const notifications = await this.messageService.deleteAllViewNotifications(user_jwt);
    client.emit('notificationsAll', notifications);
  }
}
