import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class EventChatRoom{
    @ApiProperty({
        required: true,
        type: String,
        name: 'event_id',
        example: '638e0679acd7d75b36ccc693'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    event_id: string;

    @ApiProperty({
        required: false,
        name: 'room_photo',
    })
    @IsOptional()
    room_photo?: string;

    @ApiProperty({
        required: true,
        type: String,
        name: 'name',
        example: 'Nombre del chat del evento'
    })
    @IsNotEmpty({
        message: '$property#El nombre de la sala del evento no puede estar vacío.'
    })
    name: string;

    @ApiProperty({
        required: true,
        name: 'participants',
        example: '["6397ad11acd7d75b36ccc6b9", "638e2cf2acd7d75b36ccc69e", "6372c2fcb3212a30a442f77a"]'
    })
    @IsNotEmpty({
        message: '$property#Los participantes del chat no puede estar vacío.'
    })
    participants: string[];
}

// export class EventChatRoomFormatted{
//     room_id: string;
//     receptor: string;
//     name: string;
//     messages: [];

// }