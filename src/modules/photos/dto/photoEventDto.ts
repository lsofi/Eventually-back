import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PhotoEvent{
    @ApiProperty({
        name: 'event_id',
        required: true,
        type: String,
        example: '6335fde18eb59798f6b08097'
    })
    @IsString({
        message: '$property#El valor ingresado en el id del evento no es válido.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el id del evento no debe estar vacío.'
    })
    event_id: string;

    @ApiProperty({
        name: 'photo',
        required: true,
        type: String,
    })
    @IsString({
        message: '$property#El valor ingresado en la foto del evento no es válido.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en la foto evento no debe estar vacío.'
    })
    photo: string;
}