import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteTransportDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento que contiene el transporte que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado como id del evento no es válido.'
    })
    public event_id: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el transport_id del transporte que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El id del transporte no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado como id del transporte no es válido.'
    })
    public transport_id: string;
}