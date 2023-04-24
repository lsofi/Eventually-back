import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SubscribeToConsumableDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento que contiene el consumible al cual se quiere suscribir.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado en el id del evento no es válido.'
    })
    public event_id: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el consumable_id del consumible al cual se quiere suscribir.'
    })
    @IsNotEmpty({
        message: '$property#El id del consumible no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado como id del consumible no es válido.'
    })
    public consumable_id: string;

    @ApiProperty({
        example: 2,
        required: true,
        description: 'Es la cantidad de consumible que se quiere consumir.'
    })
    @IsOptional()
    @IsNumber({},{
        message: '$property#El valor ingresado en la cantidad del consumible no es válida.'
    })
    public quantity?: number;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el user_id del invitado que se quiere suscribir a un consumible.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en el id del usuario no es válido.'
    })
    public user_id?: string
}