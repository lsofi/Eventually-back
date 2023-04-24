import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { ObjectId } from "mongodb";
import { AddressDto } from "../../../event/dto/address.dto";

export class AnswerApplicationSubscriberDto{
    @ApiProperty({
        example: "6317c1a96c3c794b8d3663ed",
        required: true,
        description: 'Es el transport_id del transporte.'
    })
    @IsNotEmpty({
        message: '$property#El id del transporte no puede estar vacío.'
    })
    public transport_id: string;

    @ApiProperty({
        example: "6317c1a96c3c794b8d3663ed",
        required: true,
        description: 'Es el event_id del evento al cual pertenece el transporte.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    public event_id: string;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el user_id del invitado al evento.'
    })
    @IsNotEmpty({
        message: '$property#El id del usuario es obligatorio.'
    })
    public subscriber_user_id: string;

    @ApiProperty({
        example: {alias: 'Bolgheri', street: 'San Martin', number: 3645, city: 'Villa Allende'},
        required: true,
        description: 'Es la dirección donde me tienen que buscar.'
    })
    @IsNotEmpty({
        message: '$property#La dirección es obligatoria.'
    })
    public subscriber_address: AddressDto;

    @ApiProperty({
        example: true,
        required: true,
        description: 'Indica si aceptó la solicitud o no.'
    })
    @IsNotEmpty({
        message: '$property#Se debe indicar si se acepta la solicitud o no.'
    })
    @IsBoolean({
        message: '$property#El valor ingresado no es válido.'
    })
    public accept: boolean;

    @ApiProperty({
        example: 'Me queda muy lejos buscarte',
        required: false,
        description: 'Es el mensaje de respuesta a la solicitud de inscripción.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El mensaje de respuesta a la solicitud no es válido.'
    })
    @MaxLength(500, {message: "$property#El mensaje de solicitud puede contener como máximo 500 caracteres."})
    public message?: string;
}