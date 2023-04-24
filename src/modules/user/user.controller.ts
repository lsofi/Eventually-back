import { BadRequestException, Body, Controller, Get, Inject, Param, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '../user/dto/request/updateUser.dto';
import { Request } from 'express';
import { UserDto } from './dto/user.dto';
import { UserServiceInterface } from './interfaces/user.interface';
import { decodeJWT } from './../../shared/shared-methods.util';
import { DeleteUserDto } from './dto/request/deleteUser.dto';
import { GetUserDto } from '../user/dto/request/getUser.dto';
import { ChangePasswordDto } from './dto/request/changePassword.dto';
import { ChangeEmailDto } from './dto/request/changeEmail.dto';

@Controller('user')
@ApiTags('Manejo de usuarios')
export class UserController {
    constructor(
        @Inject('UserServiceInterface')
        private userServiceInterface: UserServiceInterface
    ){}


    @Post('createUser')
    createUser(@Body(new ValidationPipe()) user: UserDto): Promise<boolean>{
        return this.userServiceInterface.createUser(user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('updateUser')
    updateUser(@Req() request: Request, @Body(new ValidationPipe()) user: UpdateUserDto): Promise<string>{
        const jwt = request.headers['authorization'].split(' ')[1];
        let requested_user_id = decodeJWT(jwt).sub;
        user.user_id = requested_user_id;
        try{
            return this.userServiceInterface.updateUser(user, jwt);
        }
        catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('getUser')
    getUser(@Req() request: Request): Promise<GetUserDto>{
        const jwt = request.headers['authorization'].split(' ')[1];
        let requested_user_id = decodeJWT(jwt).sub;
        
        try{
            return this.userServiceInterface.getUser(requested_user_id);
        }
        catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('deleteUser')
    deleteUser(@Req() request: Request, @Body(new ValidationPipe()) user: DeleteUserDto): Promise<boolean>{
        const jwt = request.headers['authorization'].split(' ')[1];
        let requested_user_id = decodeJWT(jwt).sub;
        
        user.user_id = requested_user_id;
        try{
            return this.userServiceInterface.deleteUser(user);
        }
        catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('changePassword')
    changePassword(@Req() request: Request, @Body(new ValidationPipe()) changePassword: ChangePasswordDto): Promise<boolean>{
        const jwt = request.headers['authorization'].split(' ')[1];
        let requested_user_id = decodeJWT(jwt).sub;
        changePassword.user_id = requested_user_id;

        try{
            return this.userServiceInterface.changePassword(changePassword);
        }
        catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('changeEmail')
    changeEmail(@Req() request: Request, @Body(new ValidationPipe()) changeEmail: ChangeEmailDto): Promise<boolean>{
        const jwt = request.headers['authorization'].split(' ')[1];
        let requested_user_id = decodeJWT(jwt).sub;
        changeEmail.user_id = requested_user_id;
        try{
            return this.userServiceInterface.changeEmail(changeEmail);
        }
        catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'user', required: true, type: String, example: 'Agus'})
    @Get('getUsersWithFilter')
    getUsersWithFilter(@Req() request: Request, @Query('user') user): Promise<UserDto>{
        const jwt = request.headers['authorization'].split(' ')[1];
        let requested_user_id = decodeJWT(jwt).sub;
        
        try{
            return this.userServiceInterface.getUsersWithFilter(user);
        }
        catch(err){
            throw new BadRequestException(err);
        }
    }
}
