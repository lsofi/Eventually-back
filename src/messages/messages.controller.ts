import { Body, Controller, Delete, Get, Post, Put, Query, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { Request } from 'express';
import { AuthGuard } from "@nestjs/passport";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateChatRoom } from "./dto/createRoom.dto";
import { EventChatRoom } from "./dto/eventChatRoom.dto";
import { MessagesService } from "./messages.service";
import { GeneralGateway } from "../modules/gateway/general-gateway.gateway";
import { ModifyEventRoomDto } from "./dto/modifiyEventRoom.dto";
import { DeleteMeFromRoomDTO } from "./dto/deleteMeFromRoom.dto";
import { DeleteServiceChatDTO } from "./dto/deleteServiceChat.dto";

@Controller('chats')
@ApiTags('Manejo de chats')
export class ChatController {
    constructor(
        private readonly messageService: MessagesService,
        private readonly gateway: GeneralGateway
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('startConversationWithProvider')
    generateChatRoom(
        @Req() request: Request,
        @Body(new ValidationPipe()) room: CreateChatRoom) {

        const jwt = request.headers['authorization'].split(' ')[1];
        return this.messageService.createRoom(room, jwt);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('startEventChatRoom')
    async generateEventChatRoom(@Req() request: Request, @Body(new ValidationPipe()) room: EventChatRoom){
        const jwt = request.headers['authorization'].split(' ')[1];
        const newRoom = await this.messageService.createEventChatRoom(room, jwt);
        this.gateway.handleEventRoomCreated(newRoom, room);
    };

    @UseGuards(AuthGuard('jwt'))
    @Put('modifyEventRoom')
    async modifyEventRoom(@Req() request: Request, @Body(new ValidationPipe()) room: ModifyEventRoomDto){
        const jwt = request.headers['authorization'].split(' ')[1];
        const roomFormmatted = await this.messageService.modifyEventRoom(room, jwt);
        this.gateway.handleEventRoomUpdated(room);
        return roomFormmatted;
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'room_id', required: true, example: '63ee72b132813fc85698430e', type: String})
    @Get('getRoomParticipants')
    async getRoomParticipants(@Req() request: Request, @Query('room_id') room_id: string){
        const jwt = request.headers['authorization'].split(' ')[1];
        return await this.messageService.getRoomParticipants(room_id, jwt);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deleteMeFromRoom')
    async deleteMeFromRoom(@Req() request: Request, @Body(new ValidationPipe()) deleteMeFromRoom: DeleteMeFromRoomDTO){
        const jwt = request.headers['authorization'].split(' ')[1];
        return await this.messageService.deleteMeFromRoom(deleteMeFromRoom, jwt);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deleteRoom')
    async deleteRoom(@Req() request: Request, @Body(new ValidationPipe()) deleteRoom: DeleteMeFromRoomDTO){
        const jwt = request.headers['authorization'].split(' ')[1];
        await this.messageService.deleteRoom(deleteRoom, jwt);
        this.gateway.handleDeleteRoom(deleteRoom);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deleteServiceChat')
    async deleteServiceChat(@Req() request: Request, @Body(new ValidationPipe()) deleteServiceRoom: DeleteServiceChatDTO){
        const jwt = request.headers['authorization'].split(' ')[1];
        await this.messageService.deleteServiceRoom(deleteServiceRoom, jwt);
        this.gateway.handleDeleteRoom(deleteServiceRoom);
    }
}