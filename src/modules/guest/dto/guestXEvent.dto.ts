import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";
import { ObjectId } from "mongodb";

export class GuestXEventDto{
    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el user_id del invitado al evento.'
    })
    @IsNotEmpty({
        message: '$property#El id del usuario no puede estar vacío.'
    })
    public user_id: ObjectId;

    @ApiProperty({
        example: true,
        required: false,
        description: 'Es la respuesta del invitado a la invitación al evento.'
    })
    @IsOptional()
    @IsBoolean({
        message: '$property#El valor ingresado no es válido.'
    })
    public accepted?: boolean;
}