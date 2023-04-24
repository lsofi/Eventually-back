import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { ConectionFileRepositoryInterface } from '../../connection-db-files/conection-files.repository.interface';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import { FilesRepository } from '../../repositories/files/files.repository.impl';
import { convertBytesToMegaBytes, isEmptyOrNullField } from '../../shared/shared-methods.util';
import { EventService } from '../event/event.service';
import { DeleteFIleDTO } from './dto/deleteFile.dto';
import { FileDTO } from './dto/file.dto';
import { FilesServiceInterface } from './interface/files.interface';
import { S3 } from "aws-sdk"
require('dotenv').config();
import {v4 as uuid} from 'uuid';
import * as JSZip from 'jszip';
import * as streamBuffers from 'stream-buffers';
import { DownloadFilesDto } from './dto/downloadFIle.dto';
@Injectable()
export class FilesService implements FilesServiceInterface {
    constructor(
        @Inject('ConectionFileRepositoryInterface')
        private readonly connectionFileRepository: ConectionFileRepositoryInterface,
        @Inject('FilesRepositoryInterface')
        private readonly filesRepositoryInterface: FilesRepository,
        private readonly eventServiceInterface: EventService,
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
        @Inject('EventRepositoryInterface')
        private readonly eventRepositoryInterface: EventRepositoryInterface
    ) { }

    async saveFiles(files: Array<Express.Multer.File>, jwt: string, event_id: string, size): Promise<boolean> {
        const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, event_id);

        if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if(permissions.role_permissions.SAVE_FILES !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

        const dbPrincipal = await this.conectionRepository.conectionToDb();
        const eventCollection = dbPrincipal.collection('Events');

        let files_storage_used = await this.eventRepositoryInterface.getFileStorageInEventById(event_id, eventCollection);
        console.log(files_storage_used);
        if(files_storage_used > 100 && permissions.creatorSubscriptionType === 'basic') throw new BadRequestException(['premium#Alcanzó la capacidad límite permitida de archivos subidos. Para poder seguir utilizando esta funcionalidad el evento debe ser premium.'])
        
        const files_storage_after_upload = files_storage_used + size;
        if(files_storage_after_upload > 100 && permissions.creatorSubscriptionType === 'basic') throw new BadRequestException(['premium#Alcanzó la capacidad límite permitida de archivos subidos. Para poder seguir utilizando esta funcionalidad el evento debe ser premium.'])
        
        const s3 = new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });

        let filesToDB = [];
        for(let file of files){
            // const fileSize = convertBytesToMegaBytes( file.size);
            // files_storage_used = files_storage_used + fileSize;

            // if(files_storage_used > 100 && permissions.creatorSubscriptionType === 'basic' ) throw new BadRequestException(['premium#Alcanzó la capacidad límite permitida de archivos subidos. Para poder seguir utilizando esta funcionalidad debes ser usuario premium.'])
            
            const uploadResult = await s3.upload({
                Bucket: process.env.AWS_BUCKET_NAME,
                Body: file.buffer,
                Key: `${event_id}-${uuid()}-${file.originalname}`,
                ACL: 'public-read'
            }).promise();

            const fileToDb = {
                originalname: file.originalname,
                event_id: new ObjectId(event_id),
                size: file.size,
                fileUrl: uploadResult.Location,
                key: uploadResult.Key
            };

            filesToDB.push(fileToDb);
        }
        console.log(files_storage_used);
        await this.eventRepositoryInterface.updateFilesStorageUse(event_id, files_storage_after_upload, eventCollection);

        const db = await this.connectionFileRepository.conectionToDb();
        const filesConnection = db.collection('Files');
        return await this.filesRepositoryInterface.saveFiles(filesToDB, filesConnection);
    }

    async generateFilesRepository(jwt: string, event_id: string): Promise<boolean> {
        const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, event_id);

        if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if (permissions.role_permissions.CREATE_FILE_REPOSITORY !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

        const db = await this.conectionRepository.conectionToDb();
        const eventCollection = db.collection('Events');

        return await this.eventRepositoryInterface.createFileRepository(event_id, eventCollection);
    }

    async deleteFile(jwt: string, deleteFile: DeleteFIleDTO): Promise<boolean> {
        const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, deleteFile.event_id);

        if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if (permissions.role_permissions.DELETE_FILE !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

        const db = await this.connectionFileRepository.conectionToDb();
        const filesConnection = db.collection('Files');

        for (let i = 0; i < deleteFile.files_id.length; i++) {
            deleteFile.files_id[i] = new ObjectId(deleteFile.files_id[i])
        }

        const dbPrincipal = await this.conectionRepository.conectionToDb();
        const eventCollection = dbPrincipal.collection('Events');
        let files_storage_used = await this.eventRepositoryInterface.getFileStorageInEventById(deleteFile.event_id, eventCollection);
        
        const size_to_remove = files_storage_used - (deleteFile.total_size / 1000000);
        let promises = [];

        const updateFilesStorage = this.eventRepositoryInterface.updateFilesStorageUse(deleteFile.event_id, size_to_remove, eventCollection);
        promises.push(updateFilesStorage);
        
        const deleteFiles =  this.filesRepositoryInterface.deleteManyFiles(deleteFile.files_id, filesConnection);
        promises.push(deleteFiles);

        await Promise.allSettled(promises);
        return true;
    }

    async deleteFilesRepository(jwt: string, event_id: string): Promise<boolean> {
        const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, event_id);

        if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if (permissions.role_permissions.DELETE_FILE_REPOSITORY !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

        const db = await this.conectionRepository.conectionToDb();
        const eventCollection = db.collection('Events');

        const deleteFileRepositoryInEvent = await this.eventRepositoryInterface.deleteFileRepository(event_id, eventCollection);

        if (!deleteFileRepositoryInEvent) return false;

        const dbFiles = await this.connectionFileRepository.conectionToDb();
        const filesConnection = dbFiles.collection('Files');

        return await this.filesRepositoryInterface.deleteFIles(event_id, filesConnection);
    }

    async getFiles(jwt: string, event_id: string, skip, limit): Promise<any> {
        const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, event_id);

        if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if (permissions.role_permissions.VIEW_FILES !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

        const dbFiles = await this.connectionFileRepository.conectionToDb();
        const filesConnection = dbFiles.collection('Files');

        const countFiles = await this.filesRepositoryInterface.countFiles(event_id, filesConnection);

        const files = await this.filesRepositoryInterface.getFiles(event_id, filesConnection, Number(skip), Number(limit));

        const dbPrincipal = await this.conectionRepository.conectionToDb();
        const eventCollection = dbPrincipal.collection('Events');

        const files_storage_used = await this.eventRepositoryInterface.getFileStorageInEventById(event_id, eventCollection);
        return { count: countFiles, files , total_size: files_storage_used};
    }

    async downloadFiles(downloadFiles: DownloadFilesDto, jwt, res) {
        try {
            const s3 = new S3({
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });

            const zip = new JSZip();
            const output = new streamBuffers.WritableStreamBuffer();

            for (let file of downloadFiles.files_info) {
                let params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: file.key
                }
                const stream = s3.getObject(params).createReadStream();
                zip.file(file.name, stream);
            }

            await zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
                output.write(content);
            });

            return output;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
}
