import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RegisterInChargeActivityDto{
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

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: false,
        description: 'Es el user_id de la persona a cargo de la actividad.'
    })
    @IsNotEmpty({
        message: '$property#El id del usuario a cargo de la actividad no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del usuario a cargo de la actividad no es válido.'
    })
    public in_charge: string; //user_id
}