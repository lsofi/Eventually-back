import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteExpenseDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento que contiene el gasto que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el id del evento no debe estar vacío.'
    })
    public event_id: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el expense_id del gasto que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el id del gasto no debe estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado en el id del gasto no es el correcto.'
    })
    public expense_id: string;

    // @ApiProperty({
    //     example: '6317c1a96c3c794b8d3663ed',
    //     required: true,
    //     description: 'Es el user_id del creador del evento que contiene el gasto que se quiere eliminar.'
    // })
    // public creator?: string
}