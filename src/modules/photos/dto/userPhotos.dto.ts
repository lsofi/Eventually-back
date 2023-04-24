import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UserPhotos{
    @ApiProperty({
        example: 'base64',
        required: true,
        description: 'Es la foto en tamaño grande'
    })
    @IsNotEmpty({
        message: '$property#La main photo no puede estar vacía.'
    })
    @IsString({
        message: '$property#La main photo debe estar en base64.'
    })
    main_photo: string;
    
    @ApiProperty({
        example: 'base64',
        required: true,
        description: 'Es la foto en tamaño chico'
    })
    @IsNotEmpty({
        message: '$property#La small photo no puede estar vacía.'
    })
    @IsString({
        message: '$property#La small photo debe estar en base64.'
    })
    small_photo: string;
}