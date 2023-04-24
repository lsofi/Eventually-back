import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto {
    @ApiProperty({
        example: 'email@gmail.com',
        required: true,
        description: 'Email del usuario'
    })
    @IsNotEmpty({message: '$property#El valor ingresado para el email no debe estar vacio'})
    @IsEmail({}, {message: '$property#El valor ingresado no tiene formato correcto de email.'})
    email: string;

    @ApiProperty({
        example: '58994587Aoloo265',
        required: true,
        description: 'Password del usuario'
    })
    @IsNotEmpty({message: '$property#El valor ingresado para la contraseña no debe estar vacio'})
    @IsString({message: '$property#El valor ingresado para la contraseña no es válido.'})
    password: string;
}