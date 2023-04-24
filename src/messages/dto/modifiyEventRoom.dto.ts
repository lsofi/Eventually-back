import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class ModifyEventRoomDto{
    @ApiProperty({
        required: true,
        type: String,
        name: 'event_id',
        example: '63d2fd672b35c71e49c317bc'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    event_id: string;

    @ApiProperty({
        required: true,
        type: String,
        name: 'room_id',
        example: '63f543dccdd4ce07046518b5'
    })
    @IsNotEmpty({
        message: '$property#El id del room no puede estar vacío.'
    })
    room_id: string;

    @ApiProperty({
        required: false,
        name: 'room_photo',
    })
    @IsOptional()
    room_photo?: string;

    @ApiProperty({
        required: false,
        type: String,
        name: 'name',
        example: 'Foto del chat del evento'
    })
    @IsOptional()
    name: string;

    @ApiProperty({
        required: false,
        name: 'participants',
        example: "['6372c2fcb3212a30a442f77a', '6372bfc40217358bcd1eff29']"
    })
    @IsOptional()
    participants: string[]
}