import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { FileDTO } from "../../modules/files/dto/file.dto";
import { ConectionRepositoryInterface } from "../../conection-db/conection.repository,interface";
import { PhotosRepositoryInterface } from "./photos.repository.interface";
import { isEmptyOrNullField } from "../../shared/shared-methods.util";

@Injectable()
export class PhotosRepository implements PhotosRepositoryInterface {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
    ) { }

    async saveFileInUser(user_id: string, profile_photo: string, small_photo: string, userCollection) {
        try {
            return await userCollection.updateOne(
                { _id: new ObjectId(user_id) },
                {
                    $set:
                    {
                        profile_photo: profile_photo,
                        small_photo: small_photo
                    }
                }
            );
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async saveFileInEvent(event_id: string, photo: string, eventCollection) {
        try {
            return await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { "event_photo": photo } }
            );
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async uploadPhotosToAlbum(photos, photosCollection): Promise<boolean>{
        try{
            const filesIntoDB =  await photosCollection.insertMany(photos);
            if(filesIntoDB.insertedCount === 0) return false;
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    
    }

    async deletePhoto(photo_id: string, photosCollection): Promise<boolean>{
        try{
            const result = await photosCollection.deleteOne({_id: new ObjectId(photo_id)});
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteManyPhotos(photos_id, photosCollection): Promise<boolean>{
        try{
            const result = await photosCollection.deleteMany({_id: {$in: photos_id}});
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deletePhotos(event_id: string, photosCollection): Promise<boolean>{
        try{
            const result = await photosCollection.deleteMany({ event_id: new ObjectId(event_id)})
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async getPhotos(event_id: string, photosCollection, skip, limit): Promise<FileDTO[]>{
        try{
            const photos = await photosCollection.aggregate(
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
                        'photoUrl': '$photoUrl',
                        'key': '$key'
                      }
                    }
                  ]
            )
            .skip(skip > 0 ? ((skip - 1) * limit) : 0)
            .limit(limit)
            .toArray();
            return photos;
        } 
        catch(err){
            throw new BadRequestException(err);
        }
    }

    async countPhotos(event_id, photosCollection): Promise<number>{
        try{    
            const result = await photosCollection.aggregate([
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