import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { EventTemplateDto } from "./eventTemplate.dto";

export class TemplateDto{
    public _id?: string;

    @ApiProperty({
        example: 'Casamiento',
        required: true,
        description: 'Es el nombre de la plantilla.'
    })
    @IsNotEmpty({
        message: '$property#El nombre de la plantilla no puede estar vacío.'
    })
    @IsString({
        message: '$property#El nombre de la plantilla no es válido.'
    })
    public name: string;

    @ApiProperty({
        example: 'https://media.istockphoto.com/id/1190043570/photo/happy-wedding-photography-of-bride-and-groom-at-wedding-ceremony-wedding-tradition-sprinkled.jpg?s=612x612&w=0&k=20&c=_aCIW5-iOIiaDdqin_50kvBcbFbIxSULHHamPUILE0c=',
        required: true,
        description: 'Es la foto de la plantilla.'
    })
    @IsNotEmpty({
        message: '$property#La foto de la plantilla no puede estar vacía.'
    })
    @IsString({
        message: '$property"La foto de la plantilla no es válida.'
    })
    public photo: string;
        
    @ApiProperty({
        example: 'Evento de casamiento para 100 personas.',
        required: true,
        description: 'Es la descripción de la plantilla.'
    })
    @IsNotEmpty({
        message: '$property#La descripción de la plantilla no puede estar vacía.'
    })
    @IsString({
        message: '$property#La descripción de la plantilla no es válida.'
    })
    public description: string;

    @ApiProperty({
        example: 'Casamiento.',
        required: true,
        description: 'Es el tipo de plantilla.'
    })
    @IsNotEmpty({
        message: "$property#El tipo de plantilla no puede estar vacío."
    })
    @IsString({
        message: '$property#El tipo de plantilla no es válido.'
    })
    public type: string;

    public event: EventTemplateDto;

    public isOwn: boolean;
}