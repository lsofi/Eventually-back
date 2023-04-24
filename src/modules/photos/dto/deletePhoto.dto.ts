import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ObjectId } from "mongodb";

export class DeletePhotoDTO{
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
        example: '63c2b246b017905c0830f949',
        required: true,
        description: 'Es el id de la foto a borrar'
    })
    @IsNotEmpty({
        message: '$property#El id de la foto no puede estar vacío.'
    })
    photos_id: string[] | ObjectId[];

    @ApiProperty({
        example: '7503',
        required: true,
        description: 'Es el peso total de las fotos a borrar'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsNumber({}, {
        message: '$property#El tamaño no es válido'
    })
    total_size: number
}