export class QuestionDto{
    public question_id: string;
    public question: string;
    public possible_answers: PossibleAnswerDto[]; 
    public type: string;
    public answers: any[]; 

    public mark0?;
    public mark100?;
}

export class PossibleAnswerDto{
    public answer_id: string;
    public answer: string;
 }

 export class AnswerQuestionDto{
    public answer_id: string;
 }