import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
export class ChangeEmailDto {
    @ApiProperty({
        example: "6317c1a96c3c794b8d3663ed'",
        required: false,
        description: 'Es el user_id del usuario que quiere cambiar su email.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en la id del usuario no es válido.'
    })
    public user_id?: string;
    
    @ApiProperty({
        example: 'Contraseña123',
        required: true,
        description: 'Es la contraseña actual del usuario.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en contraseña no debe estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado en la contraseña no es válido.'
    })
    @MinLength(8,{
        message: '$property#La contraseña ingresada debe tener al menos 8 caracteres.'
    })
    @Matches(passwordRegex, { message: '$property#La contraseña ingresada  debe contener mayúsculas, minúsculas y al menos un número.' })
    public password: string;

    @ApiProperty({
        example: 'Contraseña1905',
        required: true,
        description: 'Es el nuevo email del usuario.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el nuevo email no debe estar vacío.'
    })
    @IsEmail({},{
        message: '$property#El valor ingresado debe tener el formato correcto de una casilla de email.'
    })
    public new_email: string;
}