import { ApiProperty } from "@nestjs/swagger";
import { ObjectId } from "mongodb";

export class SubscriberXExpenseDto{
    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el user_id del invitado al evento.'
    })
    public user_id: ObjectId;

    @ApiProperty({
        example: 2,
        required: true,
        description: 'Es la cantidad de producto que consumió.'
    })
    public quantity?: number;

    constructor(user_id: ObjectId, quantity: number){
        this.user_id = user_id;
        this.quantity = quantity;
    }
}