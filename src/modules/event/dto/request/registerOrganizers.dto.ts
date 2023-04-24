import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class registerOrganizersDto {
  @ApiProperty({
    example: 'sofia99',
    required: false,
    description: 'El username del organizador',
  })
  @IsOptional()
  @IsString({
    message: 'user#El valor ingresado en el nombre de usuario no es válido.',
  })
  public username?: string;

  @ApiProperty({
    example: 'sjuarezvillagra@gmail.com',
    required: false,
    description: 'El email del organizador',
  })
  @IsOptional()
  @IsEmail({},{
    message: 'user#El valor ingresado en el email no es válido.',
  })
  public email?: string;

  @ApiProperty({
    example: '631516c39b6b86b5a973e836',
    required: true,
    description: 'El id del evento',
  })
  @IsNotEmpty({
    message: '$property#El valor ingresado en el id del vento no debe estar vacío',
  })
  @IsString(
    {
      message: '$property#El valor ingresado en el id del evento no es válido.',
    },
  )
  public event_id: string;
}