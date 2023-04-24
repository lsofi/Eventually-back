import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsMilitaryTime, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ObjectId } from 'mongodb';

export class CheckList {
  @ApiProperty({
    example: 'c13a42',
    required: true,
    description: 'Es el check_id',
  })
  @IsNotEmpty({
    message: '$property#Si quiere modificar el checklist el id no puede estar vacio.'
  })
  check_id: string;

  @ApiProperty({
    example: 'Ir al chino',
    required: false,
    description: 'El nombre del checklist'
  })
  @IsOptional()
  @IsString({
    message: '$property#Ingresó un nombre de checklist inválido.'
  })
  name?: string;

  @ApiProperty({
    example: 'false',
    required: false,
    description: 'Idica si la actividad se ocmpletó o no.'
  })
  @IsOptional()
  @IsBoolean({
    message: '$property#El valor del campo no es válido.'
  })
  completed?: boolean;
}

export class UpdateActivityDTO {
  @ApiProperty({
    example: '6317c1a96c3c794b8d3663ed',
    required: true,
    description: 'Es el event_id del evento al cual pertenece la actividad.',
  })
  @IsNotEmpty({
    message: '$property#El id del evento no puede estar vacío.'
  })
  @IsString({
    message: '$property#El id del evento no es válido.'
  })
  event_id: string;

  @ApiProperty({
    example: 'c13a42',
    required: true,
    description: 'Es el task_id la actividad a modificar.',
  })
  @IsNotEmpty({
    message: '$property#El id de la actividad no puede estar vacío.'
  })
  @IsString({
    message: '$property#El id de la actividad no es válido.'
  })
  activity_id: string;

  @ApiProperty({
    example: 'Comprar pan',
    required: false,
    description: 'El nombre de la actividad'
  })
  @IsOptional()
  @IsString({
    message: '$property#El nombre no es válido.'
  })
  @MaxLength(50, {message: "$property#El nombre puede contener como máximo 50 caracteres."})
  name?: string;

  @ApiProperty({
    example: 'Comprar pan para las hamburgesas',
    required: false,
    description: 'La descripción de la actividad'
  })
  @IsOptional()
  @IsString({
    message: '$property#El detalle de la actividad no es válido.'
  })
  @MaxLength(500, {message: "$property#La descripción no puede contener más de 500 caracteres."})
  detail?: string;

  @ApiProperty({
    example: '2022-12-03',
    required: false,
    description: 'La fecha de comienzo de la actividad.'
  })
  @IsOptional()
  @IsDateString({ strict: true}, { message: '$property#La fecha de inicio no posee el formato correcto aaaa-mm-dd.' })
  start_date?: string;

  @ApiProperty({
    example: '10:00',
    required: false,
    description: 'La hora de inicio de la actividad.'
  })
  @IsOptional()
  @IsMilitaryTime({
      message: '$property#La hora de comienzo no posee el formato correcto de HH:MM'
  })
  start_time?: string;

  @ApiProperty({
    example: '2022-12-04',
    required: false,
    description: 'La fecha de fin de la actividad.'
  })
  @IsOptional()
  end_date?: string | null;

  @ApiProperty({
    example: '10:30',
    required: false,
    description: 'La hora de fin de la actividad.'
  })
  @IsOptional()
  end_time?: string | null;
  
  @ApiProperty({
    required: false,
    type: [CheckList]
  })
  @IsOptional()
  checklist?: CheckList[];

  @IsOptional()
  in_charge?: ObjectId;

}
