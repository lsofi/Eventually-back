import { DeleteFIleDTO } from "../dto/deleteFile.dto";
import { DownloadFilesDto } from "../dto/downloadFIle.dto";
import { FileDTO } from "../dto/file.dto";

export interface FilesServiceInterface{
    saveFiles(files: Array<Express.Multer.File>, jwt:string, event_id: string, size): Promise<boolean>;
    generateFilesRepository(jwt: string, event_id: string): Promise<boolean>;
    deleteFile(jwt: string, deleteFile: DeleteFIleDTO): Promise<boolean>;
    deleteFilesRepository(jwt: string, event_id: string): Promise<boolean>;
    getFiles(jwt: string, event_id: string, skip, limit): Promise<any>;
    downloadFiles(downloadFiles: DownloadFilesDto, jwt, res)
}