import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class registerGuestsDto {
  @ApiProperty({
    example: 'sofia99',
    required: false,
    description: 'El username del invitado',
  })
  @IsOptional()
  @IsString({
    message: 'user#El valor ingresado en el $property no es válido.',
  })
  public username?: string;

  @ApiProperty({
    example: 'sjuarezvillagra@gmail.com',
    required: false,
    description: 'El email del invitado',
  })
  @IsOptional()
  @IsEmail({},{
    message: 'user#El valor ingresado en el $property no es válido.',
  })
  public email?: string;

  @ApiProperty({
    example: '631516c39b6b86b5a973e836',
    required: true,
    description: 'El id del evento',
  })
  @IsNotEmpty({
    message: '$property#$property#El valor ingresado en el $property no debe estar vacío',
  })
  @IsString(
    {
      message: '$property#El valor ingresado en el $property no es válido.',
    },
  )
  public event_id: string;
}

