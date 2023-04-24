import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsMilitaryTime, IsNotEmpty, IsOptional, IsString, MaxLength, minDate } from "class-validator";
import { CheckList } from "./request/updateActivity.dto";


export class ActivityDto{
    public activity_id: string;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el event_id del evento al cual pertenece la actividad.'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del evento no es válido.'
    })
    public event_id: string;

    @ApiProperty({
        example: 'Servir comida',
        required: true,
        description: 'Es el nombre de la actividad.'
    })
    @IsNotEmpty({
        message: '$property#El nombre de la actividad no puede estar vacío.'
    })
    @IsString({
        message: '$property#El nombre de la actividad no es válido.'
    })
    @MaxLength(50, {message: "$property#El nombre puede contener como máximo 50 caracteres."})
    public name: string;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: false,
        description: 'Es el user_id de la persona a cargo de la actividad.'
    })
    @IsOptional()
    public in_charge?; //user_id

    @ApiProperty({
        example: '2023-09-15',
        required: false,
        description: 'Es la fecha de inicio de la actividad.'
    })
    @IsOptional()
    @IsDateString({ strict: true}, { message: '$property#La fecha de comienzo de la actividad debe ser una fecha válida.' })
    public start_date?: string;

    @ApiProperty({
        example: '22:00',
        required: false,
        description: 'Es la hora de inicio de la actividad.'
    })
    @IsOptional()
    @IsMilitaryTime({
        message: '$property#La hora de comienzo no posee el formato correcto de HH:MM'
    })
    public start_time?: string;

    @ApiProperty({
        example: '2023-09-15',
        required: false,
        description: 'Es la fecha de finalización de la actividad.'
    })
    @IsOptional()
    @IsDateString({ strict: true}, { message: '$property#La fecha de fin de la actividad debe ser una fecha válida.' })
    public end_date?: string;

    @ApiProperty({
        example: '23:30',
        required: false,
        description: 'Es la hora de finalización de la actividad.'
    })
    @IsOptional()
    @IsMilitaryTime({
        message: '$property#La hora de fin no posee el formato correcto de HH:MM'
    })
    public end_time?: string;

    @ApiProperty({
        example: true,
        required: false,
        description: 'Es un valor booleano que indica si se completó o no la actividad.'
    })
    @IsOptional()
    @IsBoolean({
        message: '$property#El campo completado debe ser un booleano.'
    })
    public complete?: boolean;
    
    @ApiProperty({
        example: 'Se crea esta tarea para tener en cuenta la hora de servir la comida.',
        required: false,
        type: String
    })
    @IsOptional()
    @IsString({
        message: '$property#El detalle de la actividad no es válido.'
    })
    @MaxLength(500, {message: "$property#La descripción no puede contener más de 500 caracteres."})
    detail?: string;

    @IsOptional()
    checklist?: CheckList[];
}