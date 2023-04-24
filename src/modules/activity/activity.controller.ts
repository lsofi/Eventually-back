import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ActivityDto } from './dto/activity.dto';
import { DeleteActivityDto } from './dto/request/deleteActivity.dto';
import { RegisterInChargeActivityDto } from './dto/request/registerInChargeActivity.dto';
import { ActivityServiceInterface } from './interface/activity.interface';
import { Request } from 'express';
import { CompleteActivityDto } from './dto/request/completeActivity.dto';
import { UpdateActivityDTO } from './dto/request/updateActivity.dto';
import { DeleteInChargeDto } from './dto/request/deleteInCharge.dto';
import { GetActivityDto } from './dto/response/getActivity.dto';
import { isEmptyOrNullField } from '../../shared/shared-methods.util';

@Controller('activity')
@ApiTags('Manejo de actividades')
export class ActivityController {
    constructor(
        @Inject('ActivityServiceInterface')
        private activityServiceInterface: ActivityServiceInterface,
        ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('createActivity') 
    createActivity(@Req() request: Request, @Body(new ValidationPipe()) activity: ActivityDto): Promise<boolean> {
        try {
        const jwt = request.headers['authorization'].split(' ')[1];
        return this.activityServiceInterface.createActivity(activity, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deleteActivity')
    deleteActivity(@Req() request: Request, @Body(new ValidationPipe()) deleteActivity: DeleteActivityDto): Promise<boolean> {
    try {
        const jwt = request.headers['authorization'].split(' ')[1];
        return this.activityServiceInterface.deleteActivity(deleteActivity, jwt);
    } catch (err) {
        throw new BadRequestException(err);
    }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required: true, example: '564564dsgsd564dsfsd', type: String})
    @ApiQuery({name: 'activity_id', required: true, example: '456564dd456432165ddd465d', type: String})
    @Get('getActivity')
    getActivity(@Req() request: Request, @Query('event_id') event_id: string, @Query('activity_id') activity_id: string): Promise<GetActivityDto>{
    try {
        if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.'])
        if(isEmptyOrNullField(activity_id)) throw new BadRequestException(['activity_id#El id de la actividad no puede estar vacío.'])

        const jwt = request.headers['authorization'].split(' ')[1];
        return this.activityServiceInterface.getActivity(event_id, activity_id, jwt);
    } catch (err) {
        throw new BadRequestException(err);
    }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('registerInChargeActivity') 
    registerInChargeActivity(@Req() request: Request, @Body(new ValidationPipe()) registerInChargeActivity: RegisterInChargeActivityDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.activityServiceInterface.registerInChargeActivity(registerInChargeActivity, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required:true, example: '5652318sdgsdf231fdff', type: String})
    @Get('getEventActivities')
    getEventActivities(@Req() request: Request, @Query('event_id') event_id: string): Promise <ActivityDto[]>{
        try{
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.'])

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.activityServiceInterface.getEventActivities(event_id, jwt);
        } catch (err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('completeActivity')
    completeActivity(@Req() request: Request, @Body(new ValidationPipe()) completeActivityBody: CompleteActivityDto): Promise<boolean>{
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.activityServiceInterface.completeActivity(completeActivityBody, jwt);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('updateActivity')
    updateActivity(@Req() request: Request, @Body(new ValidationPipe()) updateActivity: UpdateActivityDTO): Promise <boolean>{
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.activityServiceInterface.updateActivity(updateActivity, jwt)
        } catch(err){
            throw new BadRequestException(err);
        }
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Put('deleteResponsible')
    deleteResponsible(@Req() request: Request, @Body(new ValidationPipe()) deleteInCharge: DeleteInChargeDto): Promise<boolean>{
        try{
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.activityServiceInterface.deleteResponsability(deleteInCharge, jwt);
        } catch(err){
            throw new BadRequestException(err);
        }
    }
}
