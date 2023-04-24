import { BadRequestException, Body, Controller, Delete, Get, Headers, Inject, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, ValidationPipe, Res} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { isEmptyOrNullField } from '../../shared/shared-methods.util';
import { DeleteFIleDTO } from './dto/deleteFile.dto';
import { DownloadFilesDto } from './dto/downloadFIle.dto';
import { FileDTO } from './dto/file.dto';
import { FilesServiceInterface } from './interface/files.interface';
var momenttz = require('moment-timezone');

@ApiTags('Manejo de archivos')
@Controller('files')
export class FilesController {
    constructor(
        @Inject('FilesServiceInterface')
        private filesServiceInterface: FilesServiceInterface
    ){}
    
    @UseGuards(AuthGuard('jwt'))
    @Post('saveFiles')
    @UseInterceptors(FilesInterceptor('files'))
    saveFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Headers() headers, @Req() request: Request){
        try {
            console.log(files)
            const jwt = request.headers['authorization'].split(' ')[1];
            const event_id = headers.event_id;
            const size = Number(headers.size) / 1000000; //viene en bytes y lo paso a MB
            return this.filesServiceInterface.saveFiles(files, jwt, event_id, size);
        } catch (err) {
            throw new BadRequestException(err)
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('generateFilesRepository')
    async generateFilesRepository(@Headers() headers, @Req() request: Request){
        const jwt = request.headers['authorization'].split(' ')[1];
        const event_id = headers.event_id;
        return await this.filesServiceInterface.generateFilesRepository(jwt, event_id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deleteFile')
    deleteFile(@Req() request: Request, @Body(new ValidationPipe()) deleteFile: DeleteFIleDTO){
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.filesServiceInterface.deleteFile(jwt, deleteFile);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('deleteFilesRepository')
    deleteFilesRepository(@Headers() headers, @Req() request: Request){
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            const event_id = headers.event_id;
            return this.filesServiceInterface.deleteFilesRepository(jwt, event_id);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required:true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getFiles')
    getFiles(@Req() request: Request, @Query('event_id') event_id: string, @Query(){skip, limit}): Promise <any>{
        try{
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.'])

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.filesServiceInterface.getFiles(jwt, event_id, skip, limit);
        } catch (err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('downloadFiles')
    async downloadPhotos(@Req() request: Request,@Res() res: Response ,@Body(new ValidationPipe()) downloadFiles: DownloadFilesDto): Promise<any>{
        try{

            const jwt = request.headers['authorization'].split(' ')[1];
            const zip = await this.filesServiceInterface.downloadFiles(downloadFiles, jwt, res);
            
            const now_time = momenttz().tz("America/Buenos_Aires").format("HH-mm");
            const now_date = momenttz().tz("America/Buenos_Aires").format("YYYY-MM-DD");            
            
            res.set({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename=eventually-files-${now_date}_${now_time}.zip`
            });
            res.send(zip.getContents())
        } catch(err){
            throw new BadRequestException(err);
        }
    }
}
