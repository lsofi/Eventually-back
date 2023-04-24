import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { decodeJWT, isEmptyOrNullField } from '../../shared/shared-methods.util';
import { ConsumableDto } from './dto/consumable.dto';
import { DeleteConsumableDto } from './dto/request/deleteConsumable.dto';
import { ConsumableServiceInterface } from './interface/consumable.interface';
import { Request } from 'express';
import { SubscribeToConsumableDto } from './dto/request/subscribeToConsumable.dto';
import { UnSubscribeToConsumableDto } from './dto/request/unsubscribeToConsumable.dto';

@Controller('consumable')
@ApiTags('Manejo de consumibles')
export class ConsumableController {
    constructor(
        @Inject('ConsumableServiceInterface')
        private consumableServiceInterface: ConsumableServiceInterface) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('createConsumable') 
    createConsumable(@Req() request: Request, @Body(new ValidationPipe()) consumable: ConsumableDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.consumableServiceInterface.createConsumable(consumable, jwt);
        } 
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deleteConsumable')
    deleteConsumable(@Req() request: Request, @Body(new ValidationPipe()) deleteConsumable: DeleteConsumableDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.consumableServiceInterface.deleteConsumable(deleteConsumable, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required: true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @ApiQuery({name: 'consumable_id', required: true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getConsumable')
    getConsumable(@Req() request: Request, @Query('event_id') event_id: string, @Query('consumable_id') consumable_id: string): Promise<ConsumableDto>{
    try {
        if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.'])
        if(isEmptyOrNullField(consumable_id)) throw new BadRequestException(['consumable_id#El id del consumible no puede estar vacío.'])

        return this.consumableServiceInterface.getConsumable(event_id, consumable_id);
    } catch (err) {
        throw new BadRequestException(err);
    }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required:true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getEventConsumables')
    getEventConsumables(@Req() request: Request, @Query('event_id') event_id: string): Promise <ConsumableDto[]>{
        try{
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.'])

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.consumableServiceInterface.getEventConsumables(event_id, jwt);
        } catch (err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('subscribeToConsumable') 
    subscribeToConsumable(@Req() request: Request, @Body(new ValidationPipe()) subscribeToConsumable: SubscribeToConsumableDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.consumableServiceInterface.subscribeToConsumable(subscribeToConsumable, jwt);
        } 
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('unsubscribeToConsumable') 
    unsubscribeToConsumable(@Req() request: Request, @Body(new ValidationPipe()) unsubscribeToConsumable: UnSubscribeToConsumableDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.consumableServiceInterface.unsubscribeToConsumable(unsubscribeToConsumable, jwt);
        } 
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('updateConsumable')
    updateConsumable(@Req() request: Request, @Body(new ValidationPipe()) updateConsumable: ConsumableDto): Promise <boolean>{
        try{
            if (isEmptyOrNullField(updateConsumable.consumable_id)) throw new BadRequestException(['consumable_id#El id del consumible no puede ser nulo.']);

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.consumableServiceInterface.updateConsumable(updateConsumable, jwt)
        } catch(err){
            throw new BadRequestException(err);
        }
    }
}