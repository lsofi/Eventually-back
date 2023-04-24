import { BadRequestException, Body, Controller, Get, HttpStatus, Inject, Post, Query, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ResetPasswordDto } from './dto/reset-password.dtos';
import { Request, Response } from 'express';
import { UserDto } from '../modules/user/dto/user.dto';
import { isEmptyOrNullField, isNotValidEmail } from '../shared/shared-methods.util';

@Controller('auth')
@ApiTags('Manejo de login')
export class AuthController {
    constructor(
        @Inject('AuthService')
        private authService: AuthService
    ) { }

    @Post('local/login')
    signinLocal(@Body(new ValidationPipe()) dto: AuthDto) {
        return this.authService.signinLocal(dto)
    }

    @ApiQuery({name: 'email', required: true, example: 'eventually@gmail.com', type: String})
    @Get('/forgotPassword')
    async forgotPassword(@Query('email') email: string): Promise<void>{

        if(isEmptyOrNullField(email)) throw new BadRequestException(['email#Se debe ingresar un valor.'])
        if(isNotValidEmail(email)) throw new BadRequestException(['email#El valor ingresado no tiene formato correcto de email.']);

        return this.authService.forgotPassword(email);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('updateJwt')
    async updateJwt(@Req() request: Request): Promise<string> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.authService.updateJwt(jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @Post('reset-password')
    async setNewPassword(@Body(new ValidationPipe()) resetPassword: ResetPasswordDto): Promise<boolean>{
        try{
            let isNewPasswordChanged: boolean = false;
            
            if(resetPassword.newPasswordToken){
                let forgotternPasswordModel = await this.authService.getForgottenPasswordModel(resetPassword.newPasswordToken); 
                isNewPasswordChanged = await this.authService.setPassword(forgotternPasswordModel.email, resetPassword.newPassword);
                if(isNewPasswordChanged) return await this.authService.deleteForgottenPasswordModel(resetPassword.newPasswordToken);
            }
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @Get('/facebook/login')
    @UseGuards(AuthGuard('facebook'))
    async facebookLogin(): Promise<any>{
        return HttpStatus.OK;
    }

    @Get('facebook/redirect')
    @UseGuards(AuthGuard('facebook'))
    async facebookLoginRedirect(@Req() req:Request): Promise<any>{
        const user = req.user as UserDto;
        return this.authService.signUser(user._id.toHexString(), user.username, user.subscriptionType);
    }

    @Get('google/login')
    @UseGuards(AuthGuard('google'))
    async googleLogin(){
        return {msg: 'google login'}
    }

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleRedirect(@Req() req: Request, @Res() res: Response){
        const user = req.user as UserDto;
        let token =this.authService.signUser(user._id.toHexString(), user.username, user.subscriptionType)
        res.redirect(`../../../postauth?t=${token}`, 301);
    }

}
