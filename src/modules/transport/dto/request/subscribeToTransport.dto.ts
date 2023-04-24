import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { AddressDto } from "../../../event/dto/address.dto";

export class SubscribeToTransportDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento que contiene el transporte al cual se quiere suscribir.'
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
        description: 'Es el transport_id del transporte al cual se quiere suscribir.'
    })
    @IsNotEmpty({
        message: '$property#El id del transporte no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado como id del transporte no es válido.'
    })
    public transport_id: string;

    @ApiProperty({
        example: "6317c1a96c3c794b8d3663ed",
        required: true,
        description: 'Es el user_id del invitado al evento.'
    })
    @IsNotEmpty({
        message: '$property#El id del usuario es obligatorio.'
    })
    public user_id: string;

    @ApiProperty({
        example: {alias: 'Bolgheri', street: 'San Martin', number: 3645, city: 'Villa Allende'},
        required: true,
        description: 'Es la dirección donde me tienen que buscar.'
    })
    @IsNotEmpty({
        message: '$property#La dirección es obligatoria.'
    })
    public address: AddressDto;

    @ApiProperty({
        example: 'Me gustaría ir con vos a la fiesta',
        required: false,
        description: 'Es el mensaje de la solicitud de inscripción.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El mensaje de solicitud no es válido.'
    })
    @MaxLength(500, {message: "$property#El mensaje de solicitud puede contener como máximo 500 caracteres."})
    public message?: string;
}