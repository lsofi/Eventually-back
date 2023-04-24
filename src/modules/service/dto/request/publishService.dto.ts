import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class PublishServiceDto{
    @ApiProperty({
        example: 'bb5dc8',
        required: true,
        description: 'Es el service_id del servicio que se quiere publicar.'
    })
    @IsNotEmpty({
        message: '$property#El id del servicio no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del servicio no es válido.'
    })
    public service_id: string;

    @ApiProperty({
        example: false,
        required: true,
        description: 'Valor booleano que indica si el servicio va a estar visible.'
    })
    @IsNotEmpty({
        message: '$property# No puede estar vacía.'
    })
    @IsBoolean({
        message: '$property#El valor ingresado  no es válido.'
    })
    public publish: boolean;
}