import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { AnswerDto } from "../answer.dto";

export class RespondPollDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento que contiene la encuesta que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado como id del evento no es válido.'
    })
    public event_id: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el poll_id de la encuesta que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El id de la encuesta no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado como id de la encuesta no es válido.'
    })
    public poll_id: string;

    @ApiProperty({
        example: [{question_id: "6317c1a96c3c794b8d3663ed", answers: ["Muy rico", "Sabroso"]}],
        required: true,
        description: 'Es el arreglo de respuestas.'
    })
    @IsNotEmpty({
        message: '$property#Las respuestas no pueden estar vacias.'
    })
    public answers: any[];
}