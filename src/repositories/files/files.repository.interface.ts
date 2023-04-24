import { FileDTO } from "../../modules/files/dto/file.dto";

export interface FilesRepositoryInterface {
    saveFiles(filesToDB, filesConnection): Promise<boolean>;
    deleteFile(file_id:string, filesConnection): Promise<boolean>;
    deleteFIles(event_id: string, filesConnection): Promise<boolean>;
    getFiles(event_id:string, filesConnection, skip, limit): Promise<any>;
    countFiles(event_id, filesCollection): Promise<number>;
    deleteManyFiles(files_id, filesCollection): Promise<boolean>
}