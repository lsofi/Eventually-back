import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PollServiceInterface } from './interface/poll.interface';
import { Request } from 'express';
import { PollDto } from './dto/poll.dto';
import { DeletePollDto } from './dto/request/deletePoll.dto';
import { isEmptyOrNullField } from '../../shared/shared-methods.util';
import { RespondPollDto } from './dto/request/respondPoll.dto';
@Controller('poll')
@ApiTags('Manejo de encuestas')
export class PollController {
    constructor(
        @Inject('PollServiceInterface')
        private pollServiceInterface: PollServiceInterface) { }
    
    @UseGuards(AuthGuard('jwt'))
    @Post('createPoll') 
    createPoll(@Req() request: Request, @Body(new ValidationPipe()) poll: PollDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.pollServiceInterface.createPoll(poll, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deletePoll')
    deletePoll(@Req() request: Request, @Body(new ValidationPipe()) deletePoll: DeletePollDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.pollServiceInterface.deletePoll(deletePoll, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('updatePoll')
    updatePoll(@Req() request: Request, @Body(new ValidationPipe()) updatePoll: PollDto): Promise <boolean>{
        try{
            if (isEmptyOrNullField(updatePoll.poll_id)) throw new BadRequestException(['Poll_id#El id del Poll no puede ser nulo.']);

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.pollServiceInterface.updatePoll(updatePoll, jwt);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required: true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @ApiQuery({name: 'poll_id', required: true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getPoll')
    getPoll(@Req() request: Request, @Query('event_id') event_id: string, @Query('poll_id') poll_id: string): Promise<PollDto>{
        try {
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.']);
            if(isEmptyOrNullField(poll_id)) throw new BadRequestException(['poll_id#El id de la encuesta no puede estar vacío.']);

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.pollServiceInterface.getPoll(event_id, poll_id, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required:true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getEventPolls')
    getEventPolls(@Req() request: Request, @Query('event_id') event_id: string): Promise <PollDto[]>{
        try{
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.']);

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.pollServiceInterface.getEventPolls(event_id, jwt);
        } catch (err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('respondPoll')
    respondPoll(@Req() request: Request, @Body(new ValidationPipe()) respondPoll: RespondPollDto): Promise <boolean>{
        try{
            if (isEmptyOrNullField(respondPoll.poll_id)) throw new BadRequestException(['Poll_id#El id del Poll no puede ser nulo.']);

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.pollServiceInterface.respondPoll(respondPoll, jwt);
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required: true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @ApiQuery({name: 'poll_id', required: true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getResultPoll')
    getResultPoll(@Req() request: Request, @Query('event_id') event_id: string, @Query('poll_id') poll_id: string): Promise <any>{
        try{
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.']);

            const jwt = request.headers['authorization'].split(' ')[1];
            return this.pollServiceInterface.getResultPoll(event_id, poll_id, jwt);
        } catch (err){
            throw new BadRequestException(err);
        }
    }
}
