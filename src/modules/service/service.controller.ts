import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { decodeJWT, isEmptyOrNullField } from '../../shared/shared-methods.util';
import { CreateServiceDto } from './dto/request/createService.dto';
import { DeleteServiceDto } from './dto/request/deleteService.dto';
import { DeleteServiceToEventDto } from './dto/request/deleteServiceToEvent.dto';
import { PublishServiceDto } from './dto/request/publishService.dto';
import { QualifyServiceDto } from './dto/request/qualifyService.dto';
import { AddServiceDto } from './dto/request/sentConfirmationServiceEmail.dto';
import { UpdateServiceDto } from './dto/request/updateService.dto';
import { GetServiceDto } from './dto/response/getService.dto';
import { ServiceDto } from './dto/service.dto';
import { ServiceServiceInterface } from './interface/service.interface';

@Controller('service')
@ApiTags('Manejo de servicios')
export class ServiceController {
    constructor(
        @Inject('ServiceServiceInterface')
        private serviceServiceInterface: ServiceServiceInterface,
        ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('createService') 
    @UseInterceptors(FileInterceptor('file'))
    createService(@Req() request: Request, @Body(new ValidationPipe()) service: CreateServiceDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.serviceServiceInterface.createService(service, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @ApiQuery({name: 'service_id', required: true, example: '456564dd456432165ddd465d', type: String})
    @Get('getService')
    getService(@Query('service_id') service_id: string): Promise<GetServiceDto>{
        try {
            if(isEmptyOrNullField(service_id)) throw new BadRequestException(['service_id#El id del servicio no puede estar vacío.'])
            return this.serviceServiceInterface.getService(service_id);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required: true, example: '456564dd456432165ddd465d', type: String})
    @Get('getEventServices')
    getEventServices(@Req() request: Request, @Query('event_id') event_id: string): Promise<any>{
        try {
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del servicio no puede estar vacío.'])
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.serviceServiceInterface.getEventServices(event_id, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deleteService')
    deleteService(@Req() request: Request, @Body(new ValidationPipe()) deleteService: DeleteServiceDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.serviceServiceInterface.deleteService(deleteService, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('publishService')
    publishService(@Req() request: Request, @Body(new ValidationPipe()) publishService: PublishServiceDto): Promise<boolean>{
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.serviceServiceInterface.publishService(publishService, jwt);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'ciudad', required: false, type: String, example: 'Rio Ceballos'})
    @ApiQuery({name: 'provincia', required: false, type: String, example: 'Cordoba'})
    @ApiQuery({name: 'type', required: false, type: String, example: 'Audio y video'})
    @ApiQuery({name: 'priceMin', required: false, type: String, example: '2000'})
    @ApiQuery({name: 'priceMax', required: false, type: String, example: '10000'})
    @ApiQuery({name: 'rating', required: false, type: String, example: '4'})
    @ApiQuery({name: 'quiet', required: true, type: String, example: true })
    @ApiQuery({name: 'name', required: false, type: String, example: 'Catering Roca'})
    @Get('getServicesWithFilters')
    getServicesWithFilters(@Req() request: Request,@Query('ciudad') ciudad, @Query('provincia') provincia, @Query('type') type, @Query('priceMin') priceMin, @Query('priceMax') priceMax, @Query('rating') rating, @Query(){skip, limit}, @Query('quiet') quiet, @Query('name') name ): Promise<GetServiceDto[]>{
        try{
            return this.serviceServiceInterface.getServicesWithFilters(ciudad, provincia, type, priceMin, priceMax, rating, skip, limit, quiet, name);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('getMyServices')
    getMyServices(@Req() request: Request): Promise<GetServiceDto[]>{
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.serviceServiceInterface.getMyServices(jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('updateService')
    updateService(@Req() request: Request, @Body(new ValidationPipe()) updateService: UpdateServiceDto): Promise<boolean>{
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.serviceServiceInterface.updateService(updateService, jwt);
        } catch(err){
            throw new BadRequestException(err);
        }
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Post('addServiceToEvent')
    sentConfirmationServiceEmail(@Req() request: Request, @Body(new ValidationPipe()) addServiceDto: AddServiceDto){
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.serviceServiceInterface.addServiceToEvent(jwt, addServiceDto);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('respondConfirmation')
    respondConfirmation(@Req()request: Request, @Body(new ValidationPipe()) addServiceDto: AddServiceDto){
        try{
            return  this.serviceServiceInterface.respondConfirmation(addServiceDto);
          } catch(err){
            throw new BadRequestException(err);
          }
        }
    
    @UseGuards(AuthGuard('jwt'))
    @Delete('deleteServiceToEvent')
    deleteServiceToEvent(@Req() request: Request, @Body(new ValidationPipe()) deleteServiceToEvent: DeleteServiceToEventDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.serviceServiceInterface.deleteServiceToEvent(deleteServiceToEvent, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('qualifyService')
    qualifyService(@Req() request: Request, @Body(new ValidationPipe()) qualifyDto: QualifyServiceDto){
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.serviceServiceInterface.qualifyService(qualifyDto, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('getServiceTypes')
    getServiceTypes(@Req() request: Request): Promise<any[]> {
    try {
      return this.serviceServiceInterface.getServiceTypes();
    } 
    catch (err) {
      throw new BadRequestException(err);
    }
  }
}
