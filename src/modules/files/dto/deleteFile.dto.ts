import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ObjectId } from "mongodb";

export class DeleteFIleDTO{
    @ApiProperty({
        example: '63c2b246b017905c0830f949',
        required: true,
        description: 'Es el id del archivo a borrar'
    })
    @IsNotEmpty({
        message: '$property#El id del archivo no puede estar vacío.'
    })
    files_id: string[] | ObjectId[];

    @ApiProperty({
        example: '63c2b246b017905c0830f949',
        required: true,
        description: 'Es el id del evento asociado al archivo'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del evento no es válido.'
    })
    event_id: string;

    @ApiProperty({
        example: '7503',
        required: true,
        description: 'Es el peso total de los archivos a borrar'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsNumber({}, {
        message: '$property#El tamaño no es válido'
    })
    total_size: number
}