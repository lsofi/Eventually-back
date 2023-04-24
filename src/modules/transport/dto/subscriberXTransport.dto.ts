import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { ObjectId } from "mongodb";
import { AddressDto } from "../../event/dto/address.dto";

export class SubscriberXTransportDto{
    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el user_id del invitado al evento.'
    })
    @IsNotEmpty({
        message: '$property#El id del usuario es obligatorio.'
    })
    public user_id: ObjectId;

    @ApiProperty({
        example: {alias: 'Bolgheri', street: 'San Martin', number: 3645, city: 'Villa Allende'},
        required: true,
        description: 'Es la dirección donde me tienen que buscar.'
    })
    @IsNotEmpty({
        message: '$property#La dirección es obligatoria.'
    })
    public address: AddressDto;
}