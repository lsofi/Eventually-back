import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ObjectId } from "mongodb";

export class SubscriberXConsumibleDto{
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
        example: 2,
        required: true,
        description: 'Es la cantidad de consumible que va a consumir.'
    })
    @IsOptional()
    @IsNumber({}, {
        message: '$property#El valor ingresado en la cantidad no es válido.'
    })
    public quantity?: number;

    constructor(user_id: ObjectId, quantity: number){
        this.user_id = user_id;
        this.quantity = quantity;
    }
}