import { PossibleAnswerDto } from "./question.dto";

export class AnswerDto{
    public question_id: string;
    public answers: PossibleAnswerDto[];
}