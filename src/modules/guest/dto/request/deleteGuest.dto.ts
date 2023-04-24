import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class DeleteGuestDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento que se quiere eliminar al invitado.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el $property no debe estar vacío',
      })
    @IsString({
        message: '$property#El valor ingresado en el $property no es válido.',
    })
    public event_id: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el user_id del creador del evento.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en el creador no es válido.'
    })
    public creator?: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el user_id del invitado que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El id del invitado no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del invitado no es válido.'
    })
    public guest_id: string;

    @ApiProperty({
        example: true,
        required: true,
        description: 'Es la respuesta del invitado a la invitación al evento.'
    })
    public accepted: boolean;
}