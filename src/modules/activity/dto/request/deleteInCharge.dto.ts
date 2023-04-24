import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteInChargeDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento que contiene la actividad que se quiere consultar.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del evento no es válido.'
    })
    public event_id: string;

    @ApiProperty({
        example: 'bb5dc8',
        required: true,
        description: 'Es el activity_id de la actividad que se quiere consultar.'
    })
    @IsNotEmpty({
        message: '$property#El id de la actividad no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id de la actividad no es válido.'
    })
    public activity_id: string;
}