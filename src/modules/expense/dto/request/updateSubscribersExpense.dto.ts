import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SubscriberXExpenseDto } from "../subscriberXExpense.dto";

export class UpdateSubscribersExpenseDto{
    @ApiProperty({
        example: "6317c1a96c3c794b8d3663ed",
        required: true,
        description: 'Es el expense_id del gasto.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el id del gasto no debe estar vacío.'
    })
    @IsString({
        message:'$property#El id del gasto no es válido.'
    })
    public expense_id: string;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el event_id del evento al cual pertenece el gasto.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el id del evento no debe estar vacío.'
    })
    public event_id: string;

    @ApiProperty({
        example: [{user_id: "ObjectId('6317c1a96c3c794b8d3663ed')", quantity: 2}, {user_id: "ObjectId('15647c1a96c3c794b8d3663ed')", quantity: 3}],
        required: true,
        description: 'Son los user_id de los invitados y la cantidad que consumieron.'
    })
    @IsNotEmpty({
        message: 'generic#Debe existir una lista de suscriptores al gasto'
    })
    @ArrayNotEmpty({
        message: '$generic#La lista de suscriptores al gasto no puede estar vacía'
    })
    @IsArray({
        message: 'generic#El valor no es válido.'
    })
    public subscribers: SubscriberXExpenseDto[]; //user_id

}