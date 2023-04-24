import { ObjectId } from "mongodb";

export class Message{
    message_id: any;
    sender: string | ObjectId; //user_id
    username: string;
    message: string;
    sentAt: string;
    seen: boolean;
}
export class CreateMessageDto {
    room: string;
    message: Message;
}
