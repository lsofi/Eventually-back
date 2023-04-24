import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DeleteServiceChatDTO{
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
}