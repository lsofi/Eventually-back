import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class DeleteConsumableDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento que contiene el consumible que se quiere eliminar.'
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
        description: 'Es el consumable_id del consumible que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El id del consumible no puede estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado como id del consumible no es válido.'
    })
    public consumable_id: string;

    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el user_id del creador del evento que contiene el consumible que se quiere eliminar.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado como creador no es válido.'
    })
    public creator?: string
}