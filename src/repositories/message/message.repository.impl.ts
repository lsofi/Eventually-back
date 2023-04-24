import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateMessageDto } from "../../messages/dto/create-message.dto";
import { ConectionRepositoryInterface } from "../../conection-db/conection.repository,interface";
import { MessageRepositoryInterface } from "./message.repository.interface";
import { ChatRoom } from "../../messages/dto/createRoom.dto";
import { ObjectId } from "mongodb";
import { ModifyEventRoomDto } from "src/messages/dto/modifiyEventRoom.dto";

@Injectable()
export class MessageRepository implements MessageRepositoryInterface {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
    ) { }

    async findRoomByUserId(user_id: string, messageCollection): Promise<ChatRoom[]> {
        try {
            const chats = await messageCollection.aggregate(
                    [
                        {
                          '$match': {
                            '$or': [
                              {
                                'receptor': new ObjectId(user_id)
                              }, {
                                'remitente': new ObjectId(user_id)
                              }
                            ]
                          }
                        }, {
                          '$lookup': {
                            'from': 'Users', 
                            'localField': 'remitente', 
                            'foreignField': '_id', 
                            'as': 'remitente_full'
                          }
                        }, {
                          '$lookup': {
                            'from': 'Services', 
                            'localField': 'service_id', 
                            'foreignField': '_id', 
                            'as': 'receptor_full'
                          }
                        }, {
                          '$lookup': {
                            'from': 'Users', 
                            'localField': 'receptor', 
                            'foreignField': '_id', 
                            'as': 'receptor_full_photo'
                          }
                        }, {
                          '$project': {
                            'receptor': 1, 
                            'remitente': 1, 
                            'messages': 1, 
                            'remitente_full.name': 1, 
                            'remitente_full.profile_photo': 1, 
                            'receptor_full.name': 1, 
                            'receptor_full.providerString': 1, 
                            'receptor_full_photo.profile_photo': 1
                          }
                        }
                      ]
            ).toArray();

            if(chats.length){
                const chatRooms: ChatRoom[] = [];
                for(let chat of chats){
                    let room = {
                        room_id: chat._id,
                        remitente: chat.remitente.toString(),
                        receptor: chat.receptor.toString(),
                        remitente_full_name: chat.remitente_full[0].name,
                        remitente_full_profile_photo: chat.remitente_full[0].profile_photo,
                        receptor_full_name: chat.receptor_full[0].name,
                        receptor_full_providerString: chat.receptor_full[0].providerString,
                        recetor_full_photo: chat.receptor_full_photo[0] ? chat.receptor_full_photo[0].profile_photo : ""
                    } as ChatRoom;
                    chatRooms.push(room);
                }

                return chatRooms;
            }
            return null;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async findRoom(room_id: string, messageCollection) {
        try {
            const room = await messageCollection.findOne({
                _id: new ObjectId(room_id)
            });
            return room;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async findRoomByServiceId(service_id: string, user_id: string, messageCollection) {
      try {
          const room = await messageCollection.findOne({
              service_id: new ObjectId(service_id),
              remitente: new ObjectId(user_id)
          });
          return room;
      } catch (err) {
          throw new BadRequestException(err);
      }
  }

    async createChatRoom(payload: ChatRoom, messageCollection) {
        try {
            await messageCollection.insertOne(payload);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async insertMessageIntoRoom(payload: CreateMessageDto, messageCollection) {
        try {
            await messageCollection.updateOne(
                { _id: payload.room },
                { $push: { messages: payload.message } }
            )
        } catch (err) {
            throw new BadRequestException(err)
        }
    }

    async createEventChatRoom(eventChatRoom, messageCollection){
      try{
        const event_room = await messageCollection.insertOne(eventChatRoom);
        return event_room.insertedId.toString();
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async findEventChatRooms(event_id: string, user_id: string, messageCollection){
      try{
        const chats = await messageCollection.aggregate(
          [
            {
              '$match': {
                'receptor': new ObjectId(event_id),
                'participants': new ObjectId(user_id)
              }
            }, {
              '$lookup': {
                'from': 'Events', 
                'localField': 'receptor', 
                'foreignField': '_id', 
                'as': 'receptor_full'
              }
            }, {
              '$project': {
                'receptor': 1, 
                'room_photo': 1, 
                'name': 1, 
                'messages': 1, 
                'receptor_full.title': 1, 
                'receptor_full.event_photo': 1
              }
            }
          ]
        ).toArray();

        if(chats.length) return chats;
        return [];
        
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async getAllNotificationsByUser(user_id: string, userCollection){
      try{
        const notifications = await userCollection.aggregate(
          [
            {
              '$match': {
                '_id': new ObjectId(user_id)
              }
            }, {
              '$project': {
                'notifications': 1
              }
            }
          ]
        ).toArray();

        return notifications[0];
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async deleteAllUserNotifications(user_id: string, userCollection){
      try{
        const notifications = await userCollection.updateOne(
          {_id: new ObjectId(user_id)},
          { $set: {notifications: []}}
        )
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async readAllUserNotifications(user_id: string, userCollection){
      try{
        const notifications = await userCollection.updateOne(
          {_id: new ObjectId(user_id)},
          { $set: {"notifications.$[element].seen": true}},
          { arrayFilters: [{ "element.seen": false }] }
        )
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async deleteNotification(user_id: string, notification_id: string, userCollection){
      try{
        const result = await userCollection.updateOne(
          {_id: new ObjectId(user_id)},
          { $pull: {"notifications": {notification_id: notification_id}}}
        )
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async readNotification(user_id: string, notification_id: string, userCollection){
      try{
        const result = await userCollection.updateOne(
        {_id: new ObjectId(user_id), "notifications.notification_id": notification_id},
        { $set: {"notifications.$.seen": true}}
      )
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async modifyEventRoom(room: ModifyEventRoomDto, messageCollection){
      try{
        const result = await messageCollection.updateOne(
          {_id: new ObjectId(room.room_id), receptor: new ObjectId(room.event_id)},
          { $set: {"room_photo": room.room_photo, "name": room.name, "participants": room.participants}}
        )
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async deleteAllViewNotifications(user_id, notifications, userCollection){
      try{
        const result = await userCollection.updateOne(
          {_id: new ObjectId(user_id)},
          { $set: {notifications: notifications}}
        )
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async getRoomParticipants(room_id:string, messageCollection){
      try{
        const idParticipants = await messageCollection.aggregate(
          [
            {
              '$match': {
                '_id': new ObjectId(room_id)
              }
            }, {
              '$project': {
                'participants': 1
              }
            }
          ]
        ).toArray();
        return idParticipants[0];
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async deleteMeFromRoom(room_id:string, user_id:string, messageCollection){
      try {
        const result = await messageCollection.updateOne(
            { _id: new ObjectId(room_id) },
            { $pull: { 'participants': new ObjectId(user_id) } }
        );
        if (result.modifiedCount !== 0) return true;
        return false;
      }
      catch (err) {
          throw new BadRequestException(err);
      }
    }

    async deleteRoom(room_id:string, messageCollection){
      try {
        await messageCollection.deleteOne({ _id: new ObjectId(room_id) });
        return true;
      } catch (err) {
          throw new BadRequestException(err);
      }
    }

    async deleteChatService(service_id: string, messageCollection){
      try{
        await messageCollection.deleteOne({service_id: new ObjectId(service_id)})
      } catch(err){
        throw new BadRequestException(err);
      }
    }

    async deleteUserInChat(user_id: string, messageCollection){
      try{
        await messageCollection.deleteOne({
          
        })
      } catch(err){
        throw new BadRequestException(err);
      }
    }
}