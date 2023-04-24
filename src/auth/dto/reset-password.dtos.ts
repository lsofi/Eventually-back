import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
export class ResetPasswordDto {
  @ApiProperty({
    example: 'Probando124',
    required: true,
    description: 'Nueva contraseña del usuario'
  })
  @IsNotEmpty({ message: '$property#El valor ingresado para la contraseña no debe estar vacio.' })
  @IsString({ message: '$property#El valor ingresado para la contraseña no es válido.' })
  @MinLength(8, {
    message: '$property#La contraseña ingresada debe tener al menos 8 caracteres.'
  })
  @Matches(passwordRegex, { message: '$property#La contraseña ingresada  debe contener mayúsculas, minúsculas y al menos un número.' })
  newPassword: string;

  @ApiProperty({
    example: 'ppow88skdk+ams',
    required: true,
    description: 'Token generado a la hora de recuperar la contraseña del usuario.'
  })
  @IsNotEmpty({ message: '$property#El valor ingresado para el token no debe estar vacio.' })
  @IsString({ message: '$property#El valor ingresado para el token no es válido.' })
  newPasswordToken: string;
}