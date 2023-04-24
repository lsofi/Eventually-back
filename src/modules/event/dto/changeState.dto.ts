import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { ObjectId } from "mongodb";

export class ChangeStateDto {
    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el event_id del evento al cual se le quiere cambiar el estado.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    public event_id: ObjectId;

}