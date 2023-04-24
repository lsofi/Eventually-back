import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePermissionsParticipants {
    @ApiProperty({
        name: 'user_id',
        type: String,
        required: true,
        example: '632f0623c08c4d68776bb7d6'
    })
    @IsNotEmpty({
        message: '$property#El id del usuario no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del usuario no es válido.'
    })
    user_id: string;

    @ApiProperty({
        name: 'user_id',
        type: String,
        required: true,
        example: '632f0623c08c4d68776bb7d6'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del evento no es válido.'
    })
    event_id: string;

    @ApiProperty({
        name: 'permissions',
        required: true,
        example: '{"ADD_SERVICE_TO_EVENT": true}'
    })
    @IsNotEmpty({
        message: '$property#El/los permisos no pueden estar vacíos.'
    })
    permissions;
}