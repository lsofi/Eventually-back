import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TransportServiceInterface } from './interface/transport.interface';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { TransportDto } from './dto/transport.dto';
import { DeleteTransportDto } from './dto/request/deleteTransport.dto';
import { isEmptyOrNullField } from '../../shared/shared-methods.util';
import { SubscribeToTransportDto } from './dto/request/subscribeToTransport.dto';
import { UnSubscribeToTransportDto } from './dto/request/unsubscribeToTransport.dto';
import { AnswerApplicationSubscriberDto } from './dto/request/answerApplicationSubscriber.dto';

@Controller('transport')
@ApiTags('Manejo de medios de transporte')
export class TransportController {
    constructor(
        @Inject('TransportServiceInterface')
        private transportServiceInterface: TransportServiceInterface
        ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('createTransport') 
    createTransport(@Req() request: Request, @Body(new ValidationPipe()) transport: TransportDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.transportServiceInterface.createTransport(transport, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deleteTransport')
    deleteTransport(@Req() request: Request, @Body(new ValidationPipe()) deleteTransport: DeleteTransportDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.transportServiceInterface.deleteTransport(deleteTransport, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('updateTransport')
    updateTransport(@Req() request: Request, @Body(new ValidationPipe()) updateTransport: TransportDto): Promise <boolean>{
        try{
            if (isEmptyOrNullField(updateTransport.transport_id)) throw new BadRequestException(['transport_id#El id del transporte no puede ser nulo.']);

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.transportServiceInterface.updateTransport(updateTransport, jwt)
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required: true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @ApiQuery({name: 'transport_id', required: true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getTransport')
    getTransport(@Req() request: Request, @Query('event_id') event_id: string, @Query('transport_id') transport_id: string): Promise<TransportDto>{
        try {
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.'])
            if(isEmptyOrNullField(transport_id)) throw new BadRequestException(['transport_id#El id del transporte no puede estar vacío.'])

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.transportServiceInterface.getTransport(event_id, transport_id, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required:true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getEventTransports')
    getEventTransports(@Req() request: Request, @Query('event_id') event_id: string): Promise <TransportDto[]>{
        try{
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.'])

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.transportServiceInterface.getEventTransports(event_id, jwt);
        } catch (err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('subscribeToTransport') 
    subscribeToTransport(@Req() request: Request, @Body(new ValidationPipe()) subscribeToTransport: SubscribeToTransportDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.transportServiceInterface.subscribeToTransport(subscribeToTransport, jwt);
        } 
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('unsubscribeToTransport') 
    unsubscribeToTransport(@Req() request: Request, @Body(new ValidationPipe()) unsubscribeToTransport: UnSubscribeToTransportDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.transportServiceInterface.unsubscribeToTransport(unsubscribeToTransport, jwt);
        } 
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('answerApplicationSubscriber') 
    answerApplicationSubscriber(@Req() request: Request, @Body(new ValidationPipe()) answerApplicationSubscriberDto: AnswerApplicationSubscriberDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.transportServiceInterface.answerApplicationSubscriber(answerApplicationSubscriberDto, jwt);
        } 
        catch (err) {
            throw new BadRequestException(err);
        }
    }


}
