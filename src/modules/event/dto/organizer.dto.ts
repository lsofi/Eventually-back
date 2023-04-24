import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { ObjectId } from "mongodb";

export class OrganizerDto {
    @ApiProperty({
        example: 'ObjectId(6317c1a96c3c794b8d3663ed)',
        required: true,
        description: 'Es el object id del user id del organizador.'
    })
    @IsNotEmpty({
        message: '$property#El id del usuario no debe estar vacío.'
    })
    public user_id: ObjectId;
}