import { ChatRoom } from "../../messages/dto/createRoom.dto";
import { CreateMessageDto } from "../../messages/dto/create-message.dto";
import { ModifyEventRoomDto } from "src/messages/dto/modifiyEventRoom.dto";

export interface MessageRepositoryInterface {
    findRoomByUserId(user_id:string, messageCollection): Promise<ChatRoom[]> ;
    findRoomByServiceId(service_id: string, user_id: string, messageCollection);
    findRoom(room:string, messageCollection);
    insertMessageIntoRoom(payload: CreateMessageDto, messageCollection);
    createChatRoom(payload: ChatRoom, messageCollection);
    createEventChatRoom(eventChatRoom, messageCollection);
    findEventChatRooms(event_id: string, user_id: string, messageCollection);
    getAllNotificationsByUser(user_id: string, userCollection);
    deleteAllUserNotifications(user_id: string, userCollection);
    readAllUserNotifications(user_id: string, userCollection);
    deleteNotification(user_id: string, notification_id: string, userCollection);
    readNotification(user_id: string, notification_id: string, userCollection);
    modifyEventRoom(room: ModifyEventRoomDto, messageCollection);
    deleteAllViewNotifications(user_id: string, notifications, userCollection);
    getRoomParticipants(room_id:string, messageCollection);
    deleteMeFromRoom(room_id:string, user_id:string, messageCollection);
    deleteRoom(room_id:string, messageCollection);
    deleteChatService(service_id: string, messageCollection);
    deleteUserInChat(user_id: string, messageCollection);
}