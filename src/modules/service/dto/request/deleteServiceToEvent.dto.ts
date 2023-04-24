import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteServiceToEventDto{
    @ApiProperty({
        example: 'bb5dc8',
        required: true,
        description: 'Es el service_id del servicio que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El id del servicio no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del servicio no es válido.'
    })
    public service_id: string;

    @ApiProperty({
        example: 'bb5dc8',
        required: true,
        description: 'Es el event_id del evento del servicio que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del evento no es válido.'
    })
    public event_id: string;
}