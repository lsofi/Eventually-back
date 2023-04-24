import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class DeleteOrganizerDto {
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento que se quiere eliminar al invitado.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el id del vento no debe estar vacío',
    })
    @IsString({
        message: '$property#El valor ingresado en el id del evento no es válido.',
    })
    public event_id: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el user_id del creador del evento.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El creador no tiene formato válido-'
    })
    public creator?: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el user_id del organizador que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El id del organizador no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del organizador no es válido.'
    })
    public organizer_id: string;
}