import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io' 
import { ObjectId } from 'mongodb';
import { decodeJWT } from 'src/shared/shared-methods.util';
import { NotificationDto } from '../gateway/dto/notifications.dto';
const EventEmitter = require('events');
const emitter = new EventEmitter()
emitter.setMaxListeners(20)
@WebSocketGateway(4443, {
  cors: {
    origin: '*'
  }
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  private connectedUsers = new Set<Map<string, string>>();

  @WebSocketServer()
  server: Server;
  
  afterInit(server: any) {
    console.log('Inicio del socket de notificaciones');
  }

  createUserMap(client: Socket, user_jwt: string): Map<string, string> {
    const userMap = new Map()
    userMap.set('client_id', client.id);
    userMap.set('user_id', decodeJWT(user_jwt).sub)
    return userMap;
  }

  handleConnection(client: Socket) {
    if(client.handshake.auth.notifications){
      client.setMaxListeners(20);
      const user_jwt = client.handshake.auth.token;
      const userMap = this.createUserMap(client, user_jwt)
      if (this.connectedUsers.has(userMap)) return;
      this.connectedUsers.add(userMap);
    } 
  }

  handleDisconnect(client: any) {
    if(client.handshake.auth.notifications){
      console.log('Alguien se fue de las notificaciones:(')
      const user_jwt = client.handshake.auth.token;
      const userMap = this.createUserMap(client, user_jwt);
      this.connectedUsers.delete(userMap);
    } 
  }

  @SubscribeMessage('emailSent')
  handleEmailSent(payload: NotificationDto, participants_users_id: ObjectId[]){
    let socket: Socket;

    this.connectedUsers.forEach(userMap => {
      if (participants_users_id.toString().includes(userMap.get('user_id'))){
        socket = this.server.sockets.sockets.get(userMap.get('client_id'));
        if (socket){
          socket.emit('notificationsOne', payload);
          console.log('Se notificó a ' + userMap.get('user_id'));
        }
      }
    })
  }
}
