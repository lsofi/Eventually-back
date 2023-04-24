import { ApiProperty } from "@nestjs/swagger";
import { ObjectId } from "mongodb";
import { Message } from "./create-message.dto";

export class ChatRoom{
    receptor: string | ObjectId;
    remitente: string | ObjectId;
    room_id: string;
    messages: Message[];
    remitente_full_name: string;
    remitente_full_profile_photo: string;
    receptor_full_name: string;
    receptor_full_providerString: string;
    recetor_full_photo: string;
}

export class CreateChatRoom{
    @ApiProperty({
        required: true,
        type: String,
        name: 'service_id',
        example: '6397ae92acd7d75b36ccc6ba'
    })
    service_id: string;
}