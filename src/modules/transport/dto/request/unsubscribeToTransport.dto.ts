import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UnSubscribeToTransportDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento que contiene el transporte al cual se quiere desuscribir.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado en el id del evento no es válido.'
    })
    public event_id: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el transport_id del transporte al cual se quiere desuscribir.'
    })
    @IsNotEmpty({
        message: '$property#El id del transporte no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado como id del transporte no es válido.'
    })
    public transport_id: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el user_id del invitado que se quiere desuscribir a un transporte.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en el id del usuario no es válido.'
    })
    public user_id?: string
}