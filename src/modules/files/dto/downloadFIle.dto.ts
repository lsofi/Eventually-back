import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class FilesInfo {
    key: string;
    name: string;
}
export class DownloadFilesDto{
    @ApiProperty({
        example: '63c2b246b017905c0830f949',
        required: true,
        description: 'Es el id de la foto a borrar'
    })
    @IsNotEmpty({
        message: '$property#El id de la foto no puede estar vacío.'
    })
    files_info: FilesInfo[];
}