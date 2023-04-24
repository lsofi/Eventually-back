import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ConectionPhotosRepositoryInterface } from '../../connection-db-photos/conection-photos.repository.interface';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import { PhotosRepositoryInterface } from '../../repositories/photos/photos.repository.interface';
import { UserRepositoryInterface } from '../../repositories/user/user.repository.interface';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { convertBytesToMegaBytes, decodeJWT, isEmptyOrNullField } from '../../shared/shared-methods.util';
import { EventService } from '../event/event.service';
import { DeletePhotoDTO } from './dto/deletePhoto.dto';
import { PhotoEvent } from './dto/photoEventDto';
import { S3 } from "aws-sdk"
require('dotenv').config();
import {v4 as uuid} from 'uuid';
import { DownloadPhotosDto } from './dto/downloadPhotosDto.dto';
var fs = require('fs');
import * as JSZip from 'jszip';
import * as streamBuffers from 'stream-buffers';
import { UserPhotos} from './dto/userPhotos.dto';
@Injectable()
export class PhotosService {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
        private readonly eventService: EventService,
        @Inject('PhotosRepositoryInterface')
        private readonly photosRepositoryInterface: PhotosRepositoryInterface,
        @Inject('UserRepositoryInterface')
        private readonly userRepositoryInterface: UserRepositoryInterface,
        @Inject('ConectionPhotosRepositoryInterface')
        private readonly conectionPhotosRepositoryInterface: ConectionPhotosRepositoryInterface,
        @Inject('EventRepositoryInterface')
        private readonly eventRepositoryInterface: EventRepositoryInterface
    ) { }

    async saveFileInUser(mainPhoto: Express.Multer.File, smallPhoto: Express.Multer.File, jwt: string) {
        const db = await this.conectionRepository.conectionToDb();
        const userCollection = db.collection('Users');
        const user_id = decodeJWT(jwt).sub;

        const profile_photo = mainPhoto.buffer.toString('base64');
        const small_photo = smallPhoto.buffer.toString('base64');
        
        const uploadPhoto = await this.photosRepositoryInterface.saveFileInUser(user_id, profile_photo, small_photo, userCollection);
        console.log(uploadPhoto);
        return true;
    }

    async saveFileInUserBase64(userPhotos: UserPhotos, jwt: string) {
        const db = await this.conectionRepository.conectionToDb();
        const userCollection = db.collection('Users');
        const user_id = decodeJWT(jwt).sub;

        const uploadPhoto = await this.photosRepositoryInterface.saveFileInUser(user_id, userPhotos.main_photo, userPhotos.small_photo, userCollection);
        return true;
    }

    async getProfileUser(jwt: string) {
        const db = await this.conectionRepository.conectionToDb();
        const userCollection = db.collection('Users');
        const user_id = decodeJWT(jwt).sub;

        const user = await this.userRepositoryInterface.findUserById(user_id, userCollection);
        return user.profile_photo;
    }

    async saveFileInEvent(jwt: string, eventPhoto: PhotoEvent) {
        const db = await this.conectionRepository.conectionToDb();
        const eventCollection = db.collection('Events');

        const event = await this.eventService.getAllPermissionsInEvent(jwt, eventPhoto.event_id);
        if (isEmptyOrNullField(event.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);

        if (event.role_permissions.SAVE_PHOTO_EVENT !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.'])

        const uploadPhoto = await this.photosRepositoryInterface.saveFileInEvent(eventPhoto.event_id, eventPhoto.photo, eventCollection);
        console.log(uploadPhoto);
        return true;
    }

    async generatePhotoAlbum(jwt: string, event_id: string): Promise<boolean>{
        const permissions = await this.eventService.getAllPermissionsInEvent(jwt, event_id);
        
        if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if(permissions.role_permissions.CREATE_PHOTO_ALBUM !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

        const db = await this.conectionRepository.conectionToDb();
        const eventCollection = db.collection('Events');

        return await this.eventRepositoryInterface.createPhotoAlbum(event_id, eventCollection);
    }

    async uploadPhotosToAlbum(files: Array<Express.Multer.File>, jwt: string, event_id: string, size): Promise<boolean> {
        const permissions = await this.eventService.getAllPermissionsInEvent(jwt, event_id);

        if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if (permissions.role_permissions.SAVE_PHOTO !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

        const dbPrincipal = await this.conectionRepository.conectionToDb();
        const eventCollection = dbPrincipal.collection('Events');

        let photos_storage_used = await this.eventRepositoryInterface.getPhotoStorageInEventById(event_id, eventCollection);
        console.log(photos_storage_used);
        if (photos_storage_used > 100 && permissions.creatorSubscriptionType === 'basic') throw new BadRequestException(['premium#Alcanzó la capacidad límite permitida del álbum de fotos. Para poder seguir utilizando esta funcionalidad el evento debe ser premium.'])

        const photo_storage_after_upload = photos_storage_used + size;
        if (photo_storage_after_upload > 100 && permissions.creatorSubscriptionType === 'basic') throw new BadRequestException(['premium#Alcanzó la capacidad límite permitida del álbum de fotos. Para poder seguir utilizando esta funcionalidad el evento debe ser premium.'])

        const s3 = new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });


        let photosToDB = [];
        for (let photo of files) {

            const uploadResult = await s3.upload({
                Bucket: process.env.AWS_BUCKET_NAME,
                Body: photo.buffer,
                Key: `${uuid()}-${photo.originalname}`,
                ACL: 'public-read'
            }).promise();

            const photoToDB = {
                originalname: photo.originalname,
                event_id: new ObjectId(event_id),
                size: photo.size,
                photoUrl: uploadResult.Location,
                key: uploadResult.Key
            };

            photosToDB.push(photoToDB);
        }
        console.log(photos_storage_used);
        await this.eventRepositoryInterface.updatePhotoStorageUse(event_id, photo_storage_after_upload, eventCollection);

        const db = await this.conectionPhotosRepositoryInterface.conectionToDb();
        const photosCollection = db.collection('Photos');

        return await this.photosRepositoryInterface.uploadPhotosToAlbum(photosToDB, photosCollection);
    }

    async deletePhoto(jwt:string, deletePhoto: DeletePhotoDTO): Promise<boolean>{
        const permissions = await this.eventService.getAllPermissionsInEvent(jwt, deletePhoto.event_id);
        
        if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if(permissions.role_permissions.DELETE_PHOTO !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

        const db = await this.conectionPhotosRepositoryInterface.conectionToDb();
        const photosCollection = db.collection('Photos');

        for (let i = 0; i < deletePhoto.photos_id.length; i++) {
            deletePhoto.photos_id[i] = new ObjectId(deletePhoto.photos_id[i])
        }
        try{
            const dbPrincipal = await this.conectionRepository.conectionToDb();
            const eventCollection = dbPrincipal.collection('Events');
            let photos_storage_used = await this.eventRepositoryInterface.getPhotoStorageInEventById(deletePhoto.event_id, eventCollection);

            const size_to_remove =  photos_storage_used - ( deletePhoto.total_size / 1000000);

            let promises = [];

            const updatePhotoStorage = this.eventRepositoryInterface.updatePhotoStorageUse(deletePhoto.event_id, size_to_remove, eventCollection);
            promises.push(updatePhotoStorage);
            
            const deletePhotos =  this.photosRepositoryInterface.deleteManyPhotos(deletePhoto.photos_id, photosCollection);
            promises.push(deletePhotos);
            
            await Promise.allSettled(promises);
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }

    }

    async deletePhotoAlbum(jwt:string, event_id:string){
        const permissions = await this.eventService.getAllPermissionsInEvent(jwt, event_id);

        if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if(permissions.role_permissions.DELETE_PHOTO_ALBUM !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

        try{
            const db = await this.conectionRepository.conectionToDb();
            const eventCollection = db.collection('Events');
            
            const deleteFileRepositoryInEvent = await this.eventRepositoryInterface.deletePhotoAlbum(event_id, eventCollection);
            
            if(!deleteFileRepositoryInEvent) return false;

            const dbPhotos = await this.conectionPhotosRepositoryInterface.conectionToDb();
            const photosCollection = dbPhotos.collection('Photos');

            return await this.photosRepositoryInterface.deletePhotos(event_id, photosCollection);

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async getPhotos(jwt: string, event_id: string, skip, limit): Promise<any>{
        const permissions = await this.eventService.getAllPermissionsInEvent(jwt, event_id);

        if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if(permissions.role_permissions.VIEW_PHOTOS !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

        try{
            const dbPhotos = await this.conectionPhotosRepositoryInterface.conectionToDb();
            const photosCollection = dbPhotos.collection('Photos');

            const photos = await this.photosRepositoryInterface.getPhotos(event_id, photosCollection, Number(skip), Number(limit));

            const countPhotos = await this.photosRepositoryInterface.countPhotos(event_id, photosCollection);

            const dbPrincipal = await this.conectionRepository.conectionToDb();
            const eventCollection = dbPrincipal.collection('Events');
            const photos_storage_used = await this.eventRepositoryInterface.getPhotoStorageInEventById(event_id, eventCollection);

            return {count: countPhotos, photos, total_size: photos_storage_used};

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async downloadPhotos(downloadPhotos: DownloadPhotosDto, jwt, res){
        try{
            const s3 = new S3({
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });
            
            const zip = new JSZip();
            const output = new streamBuffers.WritableStreamBuffer();

            for(let photo of downloadPhotos.photos_info){
                let params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: photo.key
                }
                const stream = s3.getObject(params).createReadStream();
                zip.file(photo.name, stream);
            }
            
            await zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
                output.write(content);
              });

            return output;
        } catch(err){
            throw new BadRequestException(err);
        }
    }
}
