import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CompleteActivityDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento al cual pertenece la actividad.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del evento no es válido.'
    })
    event_id: string;

    @ApiProperty({
        example: 'bb5dc8',
        required: true,
        description: 'Es el activity_id de la actividad a completar'
    })
    @IsNotEmpty({
        message: '$property#El id de la actividad no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id de la actividad no es válido.'
    })
    activity_id: string;

    @ApiProperty({
        example: 1,
        required: false,
        description: 'La verdad que no me acuerdo que era esto je'
    })
    @IsOptional()
    check_id?: number;
}