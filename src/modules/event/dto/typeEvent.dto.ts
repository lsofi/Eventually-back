import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class TypeEventDto{
    @ApiProperty({
        example: 'Casamiento',
        required: true,
        description: 'Es el nombre del tipo de evento.'
    })
    @IsNotEmpty({
        message: '$property#El nombre del tipo de evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El nombre de tipo de evento no es válido.'
    })
    public name: string;

    @ApiProperty({
        example: true,
        required: true,
        description: 'Es una bandera que indica si el evento es o no privado.'
    })
    @IsNotEmpty({
        message: '$property#La privacidad del tipo de evento no puede estar vacío.'
    })
    @IsBoolean({
        message: '$property#La privacidad del tipo de evento no es válido.'
    })
    public is_private: boolean;
}