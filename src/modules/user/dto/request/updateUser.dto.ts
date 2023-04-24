import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxDate, MaxLength, MinLength, } from "class-validator";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const date = new Date();
date.setFullYear( date.getFullYear() - 13 );
export class UpdateUserDto {
    public user_id?: string;

    @ApiProperty({
        example: 'maube99',
        required: false,
        description: 'Es el nombre de usuario'
    })
    @IsString({
        message: '$property#El valor ingresado en el nombre de usuario no es válido.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el nombre de usuario no debe estar vacío.'
    })
    @IsOptional()
    public username?: string;

    @ApiProperty({
        example: 'Agustin',
        required: false,
        description: 'Es el nombre del usuario que se quiere registrar.'
    })
    @IsString({
        message: '$property#El valor ingresado en el nombre no es válido.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el nombre de usuario no debe estar vacío.'
    })
    @MaxLength(50, {message: "$property#El nombre puede contener como máximo 50 caracteres."})
    @IsOptional()
    public name?: string;

    @ApiProperty({
        example: 'Maubecin',
        required: false,
        description: 'Es el apellido del usuario que se quiere registrar.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el nombre de usuario no debe estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado en el apellido no es válido.'
    })
    @MaxLength(50, {message: "$property#El apellido puede contener como máximo 50 caracteres."})
    @IsOptional()
    public lastname?: string;

    @ApiProperty({
        example: 'maube99@gmail.com',
        required: false,
        description: 'Es el email del usuario que se quiere registrar.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el nombre de usuario no debe estar vacío.'
    })
    @IsEmail({},{
        message: '$property#El valor ingresado debe tener el formato correcto de una casilla de email.'
    })
    @IsOptional()
    public email?: string;

    @ApiProperty({
        example: 'Contraseña123',
        required: false,
        description: 'Es la contraseña del usuario que se quiere registrar.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el nombre de usuario no debe estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado en la contraseña no es válido.'
    })
    @MinLength(8,{
        message: '$property#La contraseña ingresada debe tener al menos 8 caracteres.'
    })
    @Matches(passwordRegex, { message: '$property#La contraseña ingresada  debe contener mayúsculas, minúsculas y al menos un número.' })
    @IsOptional()
    public password?: string;

    @ApiProperty({
        example: '1999-07-21',
        required: false,
        description: 'Es la fecha de nacimiento del usuario que se quiere registrar.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el nombre de usuario no debe estar vacío.'
    })
    @IsDateString({ strict: true}, { message: '$property#El cumpleaños debe ser una fecha válida' })
    //@MaxDate( date, {message: '$property#El usuario debe tener más de 13 años.'})
    @IsOptional()
    public birthday?: string;

    @ApiProperty({
        example: 'M',
        required: false,
        description: 'Es el género de nacimiento del usuario que se quiere registrar.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el género de usuario no debe estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado en el género no es válido.'
    })
    @IsIn(['M','F','O','N'],{
        message: '$property#El valor ingresado en el género no es válido-'
    })
    @IsOptional()
    public gender?: string;
}