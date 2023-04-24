import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { decodeJWT, isEmptyOrNullField } from '../../shared/shared-methods.util';
import { EventDto } from './dto/event.dto';
import { DeleteEventDto } from './dto/request/deleteEvent.dto';
import { EventServiceInterface } from './interface/event.interface';
import { Request } from 'express';
import { eventsByRole, HistorialEventosCreadosDto } from './dto/response/historialEventoDto';
import { UpdateEventDTO } from './dto/request/updateEvent.dto';
import { GetMyEventDTO } from './dto/response/getMyEvent.dto';
import { registerOrganizersDto } from './dto/request/registerOrganizers.dto';
import { DeleteOrganizerDto } from './dto/request/deleteOrganizer.dto';
import { ChangeStateDto } from './dto/changeState.dto';
import { UpdatePermissionsRole } from '../../auth/dto/updatePermissionsRole.dto';
import { UpdatePermissionsParticipants } from '../../auth/dto/updatePermissionsParticipants.dto';
import { getEventToAddServiceDto } from './dto/response/getEventToAddService.dto';
import { TemplateDto } from './dto/template.dto';
import { TypeEventDto } from './dto/typeEvent.dto';
import { GetEventInfoDto } from './dto/response/getEventInfo.dto';
import { CreateEventDTO } from './dto/request/createEvent.dto';
import { PastHistorialEventsDTO } from './dto/response/historialEventPast.dto';



@Controller('event')
@ApiTags('Manejo de eventos')
export class EventController {
  constructor(
    @Inject('EventServiceInterface')
    private eventServiceInterface: EventServiceInterface,
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('createEvent')
  createEvent(@Req() request: Request, @Body(new ValidationPipe()) event: CreateEventDTO): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.createEvent(event, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('deleteEvent')
  deleteEvent(@Req() request: Request, @Body(new ValidationPipe()) deleteEvent: DeleteEventDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.deleteEvent(deleteEvent, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getMyEvents')
  getMyEvents(@Req() request: Request): Promise<eventsByRole[]> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.getMyEvents(jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @ApiQuery({name: 'ciudad', required: false, type: String, example: 'Rio Ceballos'})
  @ApiQuery({name: 'provincia', required: false, type: String, example: 'Cordoba'})
  @ApiQuery({name: 'tipo', required: false, type: String, example: 'Casamiento'})
  @ApiQuery({name: 'fecha', required: false, type: String, example: '2023-10-15'})
  @ApiQuery({name: 'hora', required: false, type: String, example: '17:00'})
  @ApiQuery({name: 'nombre', required: false, type: String, example: 'Joda en nueva'})
  @Get('getPublicEvents')
  getPublicEvents(@Query(){skip, limit},@Query('ciudad') ciudad, @Query('provincia') provincia, @Query('tipo') tipo, @Query('fecha') fecha, @Query('hora') hora, @Query('nombre') nombre): Promise<HistorialEventosCreadosDto[]>{
    try{
      return this.eventServiceInterface.getPublicEvents(ciudad, provincia, tipo, fecha, hora, nombre, skip, limit);
    } catch(err){
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('updateEvent')
  updateEvent(@Req() request: Request, @Body(new ValidationPipe()) updatedEvent: UpdateEventDTO): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.updateEvent(jwt, updatedEvent);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'event_id', required: true, example: '6335fde18eb59798f6b08097', type: String })
  @Get('getEvent')
  getEvent(@Req() request: Request, @Query('event_id') event_id: string): Promise<GetMyEventDTO> {
    try {
      if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede esta vacío.'])

      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.getEvent(event_id, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'event_id', required: true, example: '6335fde18eb59798f6b08097', type: String })
  @Get('getEventOrganizers')
  getEventOrganizers(@Req() request: Request, @Query('event_id') event_id: string): Promise<any> {
    try {
      if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede esta vacío.'])

      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.getEventOrganizers(event_id, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @ApiQuery({ name: 'event_id', required: true, example: '6335fde18eb59798f6b08097', type: String })
  @Get('getEventInfo')
  getEventInfo(@Query('event_id') event_id: string): Promise<GetEventInfoDto> {
    try{
      if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede esta vacío.'])

      return this.eventServiceInterface.getEventInfo(event_id);
    } catch(err){
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('registerOrganizers')
  @ApiBody({ type: [registerOrganizersDto] })
  registerOrganizers(
    @Req() request: Request,
    @Body(new ValidationPipe()) organizer: registerOrganizersDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.registerOrganizers(organizer, jwt);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('deleteOrganizer')
  deleteOrganizer(
    @Req() request: Request,
    @Body(new ValidationPipe()) deleteOrganizer: DeleteOrganizerDto
  ): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      let requested_user_id = decodeJWT(jwt).sub;
      deleteOrganizer.creator = requested_user_id;

      return this.eventServiceInterface.deleteOrganizer(deleteOrganizer, jwt);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({name: 'role', required: false, type: String, example: 'organizer'})
  @ApiQuery({name: 'name', required: false, type: String, example: 'Casamiento Cami y Kako'})
  @ApiQuery({name: 'dateFrom', required: false, type: String, example: '2022-05-15'})
  @ApiQuery({name: 'dateTo', required: false, type: String, example: '2022-07-15'})
  @ApiQuery({name: 'quiet', required: true, type: String, example: true })
  @Get('getEventsHistorialWithFilters')
  getEventsHistorialWithFilters(@Req() request: Request, @Query('role') role, @Query('name') name, @Query('dateFrom') dateFrom, @Query('dateTo') dateTo, @Query('quiet') quiet  ): Promise<PastHistorialEventsDTO[]>{
    const jwt = request.headers['authorization'].split(' ')[1];
    return this.eventServiceInterface.getEventsHistorialWithFilters(jwt, role, name, dateFrom, dateTo, quiet);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('startEvent')
  startEvent(@Req() request: Request, @Body(new ValidationPipe()) changeState: ChangeStateDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.startEvent(changeState, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('endEvent')
  endEvent(@Req() request: Request, @Body(new ValidationPipe()) changeState: ChangeStateDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.endEvent(changeState, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('endPostEvent')
  endPostEvent(@Req() request: Request, @Body(new ValidationPipe()) changeState: ChangeStateDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.endPostEvent(changeState);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('delayEvent')
  delayEvent(@Req() request: Request, @Body(new ValidationPipe()) changeState: ChangeStateDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.delayEvent(changeState, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('suspendEvent')
  suspendEvent(@Req() request: Request, @Body(new ValidationPipe()) changeState: ChangeStateDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.suspendEvent(changeState, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('cancelEvent')
  cancelEvent(@Req() request: Request, @Body(new ValidationPipe()) changeState: ChangeStateDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.cancelEvent(changeState, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('resumeEvent')
  resumeEvent(@Req() request: Request, @Body(new ValidationPipe()) changeState: ChangeStateDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.resumeEvent(changeState);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('reorganizeEvent')
  reorganizeEvent(@Req() request: Request, @Body(new ValidationPipe()) changeState: ChangeStateDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.reorganizeEvent(changeState);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({name: 'event_id', required: false, type: String, example: '6335fde18eb59798f6b08097'})
  @Get('generateInvitationLink')
  generateInvitationLink(@Req() request: Request, @Query('event_id') event_id: string): Promise<string>{
    try{
      if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede esta vacío.'])

      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.generateInvitationLink(jwt, event_id);
    } catch(err){
      throw new BadRequestException(err);
    }
  }

  @ApiQuery({name: 'hash', required: true, type: String, example: '$2b$12$CXogdrjFmfuZF5wCC1nq9OduBU..D15qcZ1gWQ7azbjLXR7ZE9MOO'})
  @Get('getEventByHash')
  getEventByHash(@Query('hash') hash: string): Promise <string> {
    try{
      if(isEmptyOrNullField(hash)) throw new BadRequestException(['hash#El hash de la invitación no puede esta vacío.'])

      return this.eventServiceInterface.getEventByHash(hash);
    } catch(err){
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('udpateRolePermissions')
  udpateRolePermissions(@Req() request: Request, @Body(new ValidationPipe()) updatePermissionsDto: UpdatePermissionsRole): Promise<boolean>{
    try{
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.udpateRolePermissions(jwt, updatePermissionsDto);
    } catch(err){
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('updateParticipantsPermissions')
  updateParticipantsPermissions(@Req() request: Request, @Body(new ValidationPipe()) updatePermissionsDto: UpdatePermissionsParticipants): Promise<boolean>{
    try{
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.updateParticipantsPermissions(jwt, updatePermissionsDto);
    } catch(err){
      throw new BadRequestException(err);
    }
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Get('getEventsToAddService')
  getEventsToAddService(@Req() request: Request): Promise<getEventToAddServiceDto[]> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.getEventsToAddService(jwt);
    } 
    catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getTemplates')
  getTemplates(@Req() request: Request): Promise<TemplateDto[]> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.getTemplates();
    } 
    catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('createTemplate')
  createTemplate(@Req() request: Request, @Body(new ValidationPipe()) template: TemplateDto): Promise<boolean> {
    try {
      return this.eventServiceInterface.createTemplate(template);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getUserTemplates')
  getUserTemplates(@Req() request: Request): Promise<TemplateDto[]> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.getUserTemplates(jwt);
    } 
    catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('createTemplateByUser')
  createTemplateByUser(@Req() request: Request, @Body(new ValidationPipe()) template: TemplateDto): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.createTemplateByUser(template, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getEventTypes')
  getEventTypes(@Req() request: Request): Promise<TypeEventDto[]> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.getEventTypes();
    } 
    catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({name: 'event_id', required: false, type: String, example: '6335fde18eb59798f6b08097'})
  @Get('getAllPermissionsInEvent')
  getAllPermissionsInEvent(@Req() request: Request, @Query('event_id') event_id: string) {
    try{
      if (isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El event_id no debe ser nulo']);
      
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.eventServiceInterface.getAllPermissionsInEvent(jwt, event_id);
    } catch(err){
      throw new BadRequestException(err);
    }
  }
}
