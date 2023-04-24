import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { isEmptyOrNullField } from "../../shared/shared-methods.util";
import { ConectionFileRepositoryInterface } from "../../connection-db-files/conection-files.repository.interface";
import { FileDTO } from "../../modules/files/dto/file.dto";
import { FilesRepositoryInterface } from "./files.repository.interface";

@Injectable()
export class FilesRepository implements FilesRepositoryInterface {
    constructor(
        @Inject('ConectionFileRepositoryInterface')
        private readonly conectionRepository: ConectionFileRepositoryInterface,
    ) { }
    
    async saveFiles(filesToDB, filesConnection): Promise<boolean>{
        try{
            const filesIntoDB =  await filesConnection.insertMany(filesToDB);
            
            if(filesIntoDB.insertedCount === 0) return false;
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteFile(file_id:string, filesConnection): Promise<boolean>{
        try{
            const result = await filesConnection.deleteOne({_id: new ObjectId(file_id)});
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteManyFiles(files_id, filesCollection): Promise<boolean>{
        try{
            const result = await filesCollection.deleteMany({_id: {$in: files_id}});
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteFIles(event_id: string, filesConnection): Promise<boolean>{
        try{
            const result = await filesConnection.deleteMany({ event_id: new ObjectId(event_id)});
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async getFiles(event_id: string, filesConnection, skip, limit): Promise<FileDTO[]>{
        try{
            const files = await filesConnection.aggregate(
                [
                    {
                      '$match': {
                        'event_id': new ObjectId(event_id)
                      }
                    }, {
                      '$project': {
                        '_id': '$_id',
                        'originalname': '$originalname', 
                        'event_id': '$event_id', 
                        'size': '$size',
                        'fileUrl': '$fileUrl',
                        'key': '$key'
                      }
                    }
                ]
            )
            .skip(skip > 0 ? ((skip - 1) * limit) : 0)
            .limit(limit)
            .toArray();
            return files;
        } 
        catch(err){
            throw new BadRequestException(err);
        }
    }

    async countFiles(event_id, filesCollection): Promise<number>{
        try{    
            const result = await filesCollection.aggregate([
                {
                    '$match': {
                        'event_id': new ObjectId(event_id)
                      }
                  }, {
                    '$count': '_id'
                }
            ]).toArray();
            
            if(!isEmptyOrNullField(result)) return result[0]._id;
            return 0;
        } catch(err){

        }
    }
}   