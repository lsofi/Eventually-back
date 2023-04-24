import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDateString, IsMilitaryTime, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { AddressDto } from "../../../modules/event/dto/address.dto";
import { SubscriberXTransportDto } from "./subscriberXTransport.dto";

export class TransportDto{
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
        example: 'Auto',
        required: true,
        description: 'Es el nombre del transporte.'
    })
    @IsNotEmpty({
        message: '$property#El nombre del transporte no puede estar vacío.'
    })
    @IsString({
        message: '$property#El nombre del transporte no es válido.'
    })
    @MaxLength(50, {message: "$property#El nombre puede contener como máximo 50 caracteres."})
    public name: string;

    @ApiProperty({
        example: 'Ford Focus Negro',
        required: false,
        description: 'Es la descripción del transporte.'
    })
    @IsOptional()
    @IsString({
        message: '$property#La descripción del transporte no es válido.'
    })
    @MaxLength(500, {message: "$property#La descripción puede contener como máximo 500 caracteres."})
    public description: string;

    @ApiProperty({
        example: '4',
        required: true,
        description: 'Indica la cantidad de lugares disponibles.'
    })
    @IsNotEmpty({
        message: '$property#Se debe indicar la cantidad de lugares disponibles.'
    })
    @IsNumber({},{
        message: '$property#El valor ingresado en la cantidad de lugares disponible no es válido.'
    })
    public available_seats: number;

    @ApiProperty({
        example: {alias: 'Casa', street: 'San Martin', number: 3645, city: 'Villa Allende', province: 'Córdoba', country: 'Argentina', coordenates: '-31.4035°, -64.206272°'},
        required: true,
        description: 'Es lugar de partida.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en la dirección de partido no puede estar vacío.'
    })
    public starting_place: AddressDto;

    @ApiProperty({
        example: '2023-09-15',
        required: true,
        description: 'Es la fecha de partida.'
    })
    @IsNotEmpty({
        message: '$property#Se debe indicar la fecha de partida.'
    })
    @IsDateString({ strict: true}, { message: '$property#La fecha de partida debe ser una fecha válida.' })
    public start_date: string;

    @ApiProperty({
        example: '22:00',
        required: true,
        description: 'Es la hora de partida.'
    })
    @IsNotEmpty({
        message: '$property#Se debe indicar la hora de partida.'
    })
    @IsMilitaryTime({
        message: '$property#La hora de partida no posee el formato correcto de HH:MM'
    })
    public start_time: string;

    @ApiProperty({
        example: '351 7178744',
        required: true,
        description: 'Es el número de teléfono de contacto.'
    })
    @IsNotEmpty({
        message: '$property#Se debe indicar el teléfono de contacto.'
    })
    @IsString({
        message: '$property#El teléfono no es válido.'
    })
    public phone_contact: string;

    @ApiProperty({
        example: 'AA123BB',
        required: true,
        description: 'Es la patente del transporte.'
    })
    @IsNotEmpty({
        message: '$property#Se debe indicar la patente del vehiculo.'
    })
    @IsString({
        message: '$property#La patente no es válida.'
    })
    public patent: string;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: false,
        description: 'Es el user_id de la persona a cargo del transporte.'
    })
    @IsOptional()
    public in_charge?;

    @ApiProperty({
        example: [{user_id: "ObjectId('6317c1a96c3c794b8d3663ed')", address: {alias: 'Bolgheri', street: 'San Martin', number: 3645, city: 'Villa Allende'}}],
        required: false,
        description: 'Son los suscriptores al transporte.'
    })
    @IsOptional()
    @IsArray({
        message: '$property#El valor en la lista de suscriptores no es válido.'
    })
    public subscribers?: SubscriberXTransportDto[]; 

    @ApiProperty({
        example: [{user_id: "ObjectId('6317c1a96c3c794b8d3663ed')", address: {alias: 'Bolgheri', street: 'San Martin', number: 3645, city: 'Villa Allende'}}],
        required: false,
        description: 'Son los suscriptores al transporte.'
    })
    @IsOptional()
    @IsArray({
        message: '$property#El valor en la lista de suscriptores no es válido.'
    })
    public applications?: SubscriberXTransportDto[]; 

}