import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsIn, IsNotEmpty,  IsOptional, IsString, Matches, MaxDate, MaxLength, MinLength, } from "class-validator";
import { ObjectId } from "mongodb";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const date = new Date();
date.setFullYear( date.getFullYear() - 13 );
export class UserDto {
    public _id?: ObjectId;

    @ApiProperty({
        example: 'maube99',
        required: true,
        description: 'Es el nombre de usuario'
    })
    @IsString({
        message: '$property#El valor ingresado en el nombre de usuario no es válido.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el nombre de usuario no debe estar vacío.'
    })
    public username: string;

    @ApiProperty({
        example: 'Agustin',
        required: true,
        description: 'Es el nombre del usuario que se quiere registrar.'
    })
    @IsString({
        message: '$property#El valor ingresado en el nombre no es válido.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el nombre no debe estar vacío.'
    })
    @MaxLength(50, {message: "$property#El nombre puede contener como máximo 50 caracteres."})
    public name: string;

    @ApiProperty({
        example: 'Maubecin',
        required: true,
        description: 'Es el apellido del usuario que se quiere registrar.'
    })
    @IsString({
        message: '$property#El valor ingresado en el apellido no es válido.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el apellido no debe estar vacío.'
    })
    @MaxLength(50, {message: "$property#El apellido puede contener como máximo 50 caracteres."})
    public lastname: string;

    @ApiProperty({
        example: 'maube99@gmail.com',
        required: true,
        description: 'Es el email del usuario que se quiere registrar.'
    })
    @IsEmail({},{
        message: '$property#El valor ingresado debe tener el formato correcto de una casilla de email.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el $property no debe estar vacío.'
    })
    public email: string;

    @ApiProperty({
        example: 'Contraseña123',
        required: true,
        description: 'Es la contraseña del usuario que se quiere registrar.'
    })
    @IsString({
        message: '$property#El valor ingresado en la contraseña no es válido.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en la contraseña y no debe estar vacío.'
    })
    @MinLength(8,{
        message: '$property#La contraseña ingresada debe tener al menos 8 caracteres.'
    })
    @Matches(passwordRegex, { message: '$property#La contraseña ingresada  debe contener mayúsculas, minúsculas y al menos un número.' })
    public password: string;

    @ApiProperty({
        example: '1999-07-21',
        required: true,
        description: 'Es la fecha de nacimiento del usuario que se quiere registrar.'
    })
    @IsDateString({ strict: true}, { message: '$property#La fecha de nacimiento debe ser una fecha válida' })
    @IsNotEmpty({
        message: '$property#El valor ingresado en la fecha de nacimiento no debe estar vacío.'
    })
    //@MaxDate( date, {message: '$property#El usuario debe tener más de 13 años.'})
    public birthday: string;

    @ApiProperty({
        example: '2022-07-18',
        required: false,
        description: 'Es la fecha en la cual el usuario se dió de baja.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en el $property no es válido.'
    })
    @IsDateString({ strict: true}, { message: '$property#$property debe ser una fecha válida' })
    public eliminated_date?: string;

    @ApiProperty({
        example: 'M',
        required: true,
        description: 'Es el género del usuario que se quiere registrar.'
    })
    @IsString({
        message: '$property#El valor ingresado en el género no es válido.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en el género no debe estar vacío.'
    })
    @IsIn(['M','F','O','N'], {
        message: '$property#El valor ingresado en el género no es válido.'
    })
    public gender: string;

    notifications: [];

    public subscriptionType?: string;

}