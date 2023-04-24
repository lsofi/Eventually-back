import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class QualifyServiceDto{
    @ApiProperty({
        example: 'bb5dc8',
        required: true,
        description: 'Es el service_id del servicio que se quiere calificar.'
    })
    @IsNotEmpty({
        message: '$property#El id del servicio no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del servicio no es válido.'
    })
    public service_id: string;

    @ApiProperty({
        example: 'bb5dc8',
        required: true,
        description: 'Es el event_id del evento del servicio que se quiere calificar.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del evento no es válido.'
    })
    public event_id: string;

    @ApiProperty({
        example: 10,
        required: true,
        description: 'Indica la calificación.'
    })
    @IsNotEmpty({
        message: '$property#Se debe indicar la calificación.'
    })
    @IsNumber({},{
        message: '$property#El valor ingresado en la calificación no es válido.'
    })
    public rate: number;
}