import { BadRequestException, Body, Controller, Get, Post, Req, UploadedFiles, UseGuards, UseInterceptors, ValidationPipe, Headers, Delete, Put, Query, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor, FilesInterceptor} from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { Request, Response } from 'express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PhotoEvent } from './dto/photoEventDto';
import { DeletePhotoDTO } from './dto/deletePhoto.dto';
import { isEmptyOrNullField } from '../../shared/shared-methods.util';
import { DownloadPhotosDto } from './dto/downloadPhotosDto.dto';
import { UserPhotos} from './dto/userPhotos.dto';
var momenttz = require('moment-timezone');

@ApiTags('Manejo de fotos')
@Controller('photos')
export class PhotosController {
    constructor(
        private readonly photosService: PhotosService
    ){}
    
    @UseGuards(AuthGuard('jwt'))
    @Post('updloadProfilePhoto')
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'mainPhoto', maxCount: 1},
        {name: 'smallPhoto', maxCount: 1}
    ]))
    async updloadProfilePhoto(@UploadedFiles() files: {mainPhoto: Express.Multer.File, smallPhoto: Express.Multer.File}, @Req() request: Request){
        try{
            const mainPhoto = files.mainPhoto[0];
            const smallPhoto = files.smallPhoto[0];
            const jwt = request.headers['authorization'].split(' ')[1];
            return await this.photosService.saveFileInUser(mainPhoto, smallPhoto, jwt);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('uploadProfilePhotoBase64')
    async uploadProfilePhotoBase64(@Req() request: Request, @Body(new ValidationPipe()) userPhotos: UserPhotos){
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            return await this.photosService.saveFileInUserBase64(userPhotos, jwt);
        } catch(err){
            throw new BadRequestException(err);
        }
    }


    @UseGuards(AuthGuard('jwt'))
    @Get('getProfilePhoto')
    async getUserProfilePhoto(@Req() request: Request){
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            return await this.photosService.getProfileUser(jwt);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('updloadEventPhoto')
    async saveFileInEvent(@Req() request: Request, @Body(new ValidationPipe()) eventPhoto: PhotoEvent){
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            return await this.photosService.saveFileInEvent(jwt, eventPhoto);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('generatePhotoAlbum')
    async generatePhotoAlbum( @Headers() headers, @Req() request: Request){
        const jwt = request.headers['authorization'].split(' ')[1];
        const event_id = headers.event_id;
        return await this.photosService.generatePhotoAlbum(jwt, event_id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('uploadPhotosToAlbum')
    @UseInterceptors(FilesInterceptor('files'))
    uploadPhotosToAlbum(@UploadedFiles() files: Array<Express.Multer.File>, @Headers() headers, @Req() request: Request){
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            const event_id = headers.event_id;
            const size = Number(headers.size) / 1000000; //viene en bytes y lo paso a MB
            return this.photosService.uploadPhotosToAlbum(files, jwt, event_id, size);
        } catch(err){
            throw new BadRequestException(err)
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deletePhoto')
    deletePhoto(@Req() request: Request, @Body(new ValidationPipe()) deletePhoto: DeletePhotoDTO){
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.photosService.deletePhoto(jwt, deletePhoto);
        } catch(err){
            throw new BadRequestException(err);
        }  
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('deletePhotoAlbum')
    deletePhotoAlbum(@Headers() headers, @Req() request: Request){
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            const event_id = headers.event_id;

            return this.photosService.deletePhotoAlbum(jwt, event_id);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required:true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getPhotos')
    getPhotos(@Req() request: Request, @Query('event_id') event_id: string, @Query(){skip, limit}): Promise <any>{
        try{
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.'])

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.photosService.getPhotos(jwt, event_id, skip, limit);
        } catch (err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('downloadPhotos')
    async downloadPhotos(@Req() request: Request,@Res() res: Response ,@Body(new ValidationPipe()) downloadPhotos: DownloadPhotosDto): Promise<any>{
        try{

            const jwt = request.headers['authorization'].split(' ')[1];
            const zip = await this.photosService.downloadPhotos(downloadPhotos, jwt, res);
            
            const now_time = momenttz().tz("America/Buenos_Aires").format("HH-mm");
            const now_date = momenttz().tz("America/Buenos_Aires").format("YYYY-MM-DD");            
            
            res.set({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename=eventually-photos-${now_date}_${now_time}.zip`
            });
            res.send(zip.getContents())
        } catch(err){
            throw new BadRequestException(err);
        }
    }
}