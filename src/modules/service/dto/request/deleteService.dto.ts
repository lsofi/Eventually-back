import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteServiceDto{
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
        example: 'Hola1234',
        required: true,
        description: 'Es la contraseña del creador del servicio que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#La contraseña no puede estar vacía.'
    })
    @IsString({
        message: '$property#La contraseña no es válida.'
    })
    public password: string;
}