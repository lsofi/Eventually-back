import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteEventDto{
    @ApiProperty({
        example: '6312143443c4a5b9000b8220',
        required: true,
        description: 'Es el event_id del evento que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío-'
    })
    @IsString({
        message: '$prperty#El id del evento no es válido.'
    })
    public event_id: string;

    @ApiProperty({
        example: 'Hola1234',
        required: true,
        description: 'Es la contraseña del creador del evento que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#La contraseña no puede estar vacía.'
    })
    @IsString({
        message: '$property#La contraseña no es válida.'
    })
    public password: string;
}