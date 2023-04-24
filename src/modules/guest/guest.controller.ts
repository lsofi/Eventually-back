import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, Put, Query, Req, UseGuards, ValidationPipe} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { registerGuestsDto } from './dto/request/registerGuest.dto';
import { registerGuestResponseDto } from './dto/response/registerGuestResponse.dto';
import { GuestServiceInterface } from './interfaces/guest.interface';
import { Request } from 'express';
import { GuestDto } from './dto/guest.dto';
import { DeleteGuestDto } from './dto/request/deleteGuest.dto';
import { decodeJWT, isEmptyOrNullField } from '../../shared/shared-methods.util';
import { RespondInvitationDTO } from './dto/request/respondInvitation.dto';

@Controller('guest')
@ApiTags('Manejo de invitados')
export class GuestController {
  constructor(
    @Inject('GuestServiceInterface')
    private guestServiceInterface: GuestServiceInterface,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('registerGuest')
  @ApiBody({ type: [registerGuestsDto] })
  registerGuest(
    @Req() request: Request,
    @Body(new ValidationPipe()) guest: registerGuestsDto,
  ): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];
      return this.guestServiceInterface.registerGuest(guest, jwt);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({name: 'event_id', required:true, example: '456456sdgasd65465d', type: String})
  @Get('getGuests')
  getGuests(@Req() request: Request, @Query('event_id') event_id: string): Promise<GuestDto[]> {
    try {
      if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.'])
      return this.guestServiceInterface.getGuests(event_id);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('deleteGuest')
  deleteGuest(
  @Req() request: Request,
  @Body(new ValidationPipe()) deleteGuest: DeleteGuestDto,
  ): Promise<boolean> {
    try {
      const jwt = request.headers['authorization'].split(' ')[1];

      return this.guestServiceInterface.deleteGuest(deleteGuest, jwt);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('respondInvitation')
  respondInvitation(@Req() request: Request, @Body(new ValidationPipe()) respondInvitation: RespondInvitationDTO){
    try{
      const jwt = request.headers['authorization'].split(' ')[1];
      return  this.guestServiceInterface.respondInvitation(respondInvitation, jwt);
    } catch(err){
      throw new BadRequestException(err);
    }
  }
}
