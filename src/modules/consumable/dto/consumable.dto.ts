import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ObjectId } from "mongodb";
import { SubscriberXConsumibleDto } from "./subscriberXConsumible.dto";

export class ConsumableDto{
    public consumable_id: string;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el event_id del evento al cual pertenece el consumible.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    public event_id: ObjectId;

    @ApiProperty({
        example: 'Choripan',
        required: true,
        description: 'Es el nombre del consumible.'
    })
    @IsNotEmpty({
        message: '$property#El nombre del consumible no puede estar vacío.'
    })
    @IsString({
        message: '$property#El nombre del consumible no es válido.'
    })
    @MaxLength(50, {message: "$property#El nombre puede contener como máximo 50 caracteres."})
    public name: string;

    @ApiProperty({
        example: 'Pan, Chorizo, Salsa criolla, Chimi y Mayonesa',
        required: true,
        description: 'Es la descripción del consumible.'
    })
    @IsOptional()
    @IsString({
        message: '$property#La descripción del consumible no es válido.'
    })
    public description: string;

    @ApiProperty({
        example: true,
        required: true,
        description: 'Indica si el consumible es cuantificable o no.'
    })
    @IsNotEmpty({
        message: '$property#Se debe indicar si el consumible es cuantificable.'
    })
    @IsBoolean({
        message: '$property#El valor ingresado no es válido.'
    })
    public quantifiable: boolean;

    @ApiProperty({
        example: [{user_id: "ObjectId('6317c1a96c3c794b8d3663ed')", quantity: 2}, {user_id: "ObjectId('15647c1a96c3c794b8d3663ed')", quantity: 3}],
        required: false,
        description: 'Es el user_id del invitado y la cantidad de consumible que va a consumir.'
    })
    @IsOptional()
    @IsArray({
        message: '$property#El valor en la lista de suscriptores del consumible no es válido.'
    })
    public subscribers?: SubscriberXConsumibleDto[]; //user_id

}