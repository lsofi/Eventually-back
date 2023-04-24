import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class DeleteUserDto {
    @ApiProperty({
        example: "6317c1a96c3c794b8d3663ed'",
        required: true,
        description: 'Es el user_id del usuario que se quiere eliminar.'
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en la id del usuario no es válido.'
    })
    public user_id?: string;
    
    @ApiProperty({
        example: 'Contraseña123',
        required: true,
        description: 'Es la contraseña del usuario que se quiere eliminar.'
    })
    @IsNotEmpty({
        message: '$property#El valor ingresado en la contraseña no debe estar vacío.'
    })
    @IsString({
        message: '$property#El valor ingresado en la contraseña no es válido.'
    })
    public password: string;
}