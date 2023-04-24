import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { AnswerDto } from "./answer.dto";
import { QuestionDto } from "./question.dto";

export class PollDto{
    @IsOptional()
    @IsString({message:'$property#El id de la encuesta no puede ser nulo'})
    public poll_id?: string;

    @ApiProperty({
        example: "6317c1a96c3c794b8d3663ed",
        required: true,
        description: 'Es el event_id del evento al cual pertenece la encuesta.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    public event_id: string;

    @ApiProperty({
        example: 'Encuesta sobre la atención recibida',
        required: true,
        description: 'Es el nombre de la encuesta.'
    })
    @IsString({message: '$property#El valor ingresado en el nombre de la encuesta no es válido.'})
    @IsNotEmpty({message: '$property#El valor ingresado en el nombre de la encuesta no debe estar vacío.'})
    @MaxLength(50, {message: "$property#El nombre de la encuesta puede contener como máximo 50 caracteres."})
    public name: string;

    @ApiProperty({
        example: true,
        required: true,
        description: 'Indica si la encuesta está visible o no.'
    })
    @IsNotEmpty({message: '$property#El campo no puede estar vacío.'})
    @IsBoolean({message: '$property#Se debe indicar si la encuesta está visible.'})
    public visible: boolean;

    @ApiProperty({
        example: [  {question_id: "66554488", 
                     question: "¿Cómo fue la atención de los mosos?",
                     possible_answers: [
                        {"answer_id": 1, "answer": "Buena"},
                        {"answer_id": 2, "answer": "Mala"}
                      ],
                     type: "multiple_choice"
                    },
                    {question_id: "66554489", 
                     question: "¿Cómo fue la atención del personal de la barra?",
                     possible_answers: [
                        {"answer_id": 1, "answer": "Buena"},
                        {"answer_id": 2, "answer": "Mala"}
                      ],
                     type: "multiple_choice"
                    }
                ],
        required: false,
        description: 'Son las preguntas que contiene la encuesta.'
    })
    public questions?: QuestionDto[];

    public answers?: AnswerDto[];

    public users_answered?: string[];

    public has_answers?: boolean;
}