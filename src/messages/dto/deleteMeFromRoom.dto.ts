import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DeleteMeFromRoomDTO{
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
        required: true,
        type: String,
        name: 'event_id',
        example: '63d2fd672b35c71e49c317bc'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    event_id?: string;
}