import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsMilitaryTime, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddServiceDto{
    @ApiProperty({
        name: 'service_id',
        type: String,
        example: '63547b747ac2fa1106f954f8',
        required: true
    })
    @IsNotEmpty({
        message: '$property#El id del servicio no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del servicio no es válido.'
    })
    service_id: string;

    @ApiProperty({
        name: 'event_id',
        type: String,
        example: '6335fde18eb59798f6b08097',
        required: true
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del evento no es válido.'
    })
    event_id: string;

    accepted: boolean;

    @ApiProperty({
        name: 'date_service',
        type: String,
        example: '2022-01-21',
        required: true
    })
    @IsOptional({
        message: '$property#La fecha del servicio no puede estar vacía.'
    })
    @IsDateString({},{
        message: '$property#La fecha ingresada no tiene el formato correcto.'
    })
    date_service: string;

    @ApiProperty({
        name: 'time_service',
        type: String, 
        example: '08:15'
    })
    @IsOptional({
        message: '$property#La hora del servicio no puede estar vacía.'
    })
    @IsMilitaryTime({
        message: '$property#La hora ingresada no tiene el formato válido.'
    })
    time_service: string;
}