import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { ObjectId } from "mongodb";
import { SubscriberXExpenseDto } from "./subscriberXExpense.dto";

export class ExpenseDto{
    @IsOptional()
    @IsString({
        message:'$property#El id del gasto no puede ser nulo'
    })
    public expense_id?: string;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el event_id del evento al cual pertenece el gasto.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el id del evento no debe estar vacío.'
    })
    public event_id: ObjectId;

    @ApiProperty({
        example: 'Choripan',
        required: true,
        description: 'Es el nombre del gasto.'
    })
    @IsString({
        message: '$property#El valor ingresado en el nombre del gasto no es válido.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el nombre del gasto no debe estar vacío.'
    })
    @MaxLength(50, {message: "$property#El nombre del gasto puede contener como máximo 50 caracteres."})
    public name: string;

    @ApiProperty({
        example: 'Pan, Chorizo, Salsa criolla, Chimi y Mayonesa',
        required: false,
        description: 'Es la descripción del gasto.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en el nombre del gasto no es válido.'
    })
    @MaxLength(500, {
        message: '$property#La descripción del gasto no puede superar los 500 caracteres.'
    })
    public description?: string;

    @ApiProperty({
        example: 2500,
        required: true,
        description: 'Es el monto que se gastó en la compra.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el monto del gasto no debe estar vacío.'
    })
    @IsNumber({}, {message: '$property#El valor del monto debe ser un número'})
    public amount: number;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el invitado que realizó la compra.'
    })
    public in_charge: ObjectId;

    @ApiProperty({
        example: true,
        required: true,
        description: 'Indica si el gasto es cuantificable o no.'
    })
    @IsNotEmpty({message: '$property#El campo no puede estar vacío.'})
    @IsBoolean({message: '$property#Se debe indicar si el gasto es cuantificable.'})
    public quantifiable: boolean;

    @ApiProperty({
        example: '2',
        required: false,
        description: 'Indica la cantidad total que se consumió.'
    })
    @IsOptional()
    @IsNumber({}, {message: '$property#El valor de la cantidad total debe ser un número'})
    public total_quantity?: number;

    @ApiProperty({
        example: [{user_id: "ObjectId('6317c1a96c3c794b8d3663ed')", quantity: 2}, {user_id: "ObjectId('15647c1a96c3c794b8d3663ed')", quantity: 3}],
        required: false,
        description: 'Son los user_id de los invitados y la cantidad que consumieron.'
    })
    public subscribers?: SubscriberXExpenseDto[]; //user_id

    @ApiProperty({
        example: 'true',
        required: false,
        description: 'Indica si el gasto es propio o no.',
        type: Boolean
    })
    @IsOptional()
    @IsBoolean({message: '$property#Se debe indicar si el gasto es propio o no.'})
    public isOwn?: boolean;

}