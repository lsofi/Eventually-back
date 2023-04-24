import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {Profile, Strategy, VerifyCallback} from 'passport-google-oauth20';
import { UserDto } from "../../modules/user/dto/user.dto";
import { AuthService } from "../auth.service";
import * as bcrypt from 'bcrypt';
require('dotenv').config();
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
    constructor(
        @Inject('AuthService')
        private readonly authService: AuthService
    ){
        const callbackURL = process.env.ENVIRONMENT == 'prod'? process.env.GOOGLE_CALLBACK_URL_PROD : process.env.GOOGLE_CALLBACK_URL_STG
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: callbackURL,
            scope: ['https://www.googleapis.com/auth/userinfo.profile', 'email']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done:VerifyCallback ){;
        const { name, emails, photos} = profile;
        const numerUser = (Math.floor(Math.random() * (90000))).toString(); //7 digits
        const saltOrRounds = 12;
        const password = this.generatePasswordRand(8, 'rand');
        const hash = await bcrypt.hash(password, saltOrRounds)
        const user = {
            username: `${name.givenName}${name.familyName}${numerUser}`,
            email: emails[0].value,
            name: name.givenName,
            lastname: name.familyName,
            eliminated_date: null,
            password: hash,
            subscriptionType: 'basic'
        } as unknown as UserDto;
        console.log(user);
        const userInDB = await this.authService.validateUser(user, password);
        console.log(userInDB);
        done(null, userInDB);
    }

    generatePasswordRand(length,type) {
        let characters;
        switch(type){
            case 'num':
                characters = "0123456789";
                break;
            case 'alf':
                characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                break;
            case 'rand':
                //FOR ↓
                break;
            default:
                characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                break;
        }
        var pass = "";
        for (let i=0; i < length; i++){
            if(type == 'rand'){
                pass += String.fromCharCode((Math.floor((Math.random() * 100)) % 94) + 33);
            }else{
                pass += characters.charAt(Math.floor(Math.random()*characters.length));   
            }
        }
        return pass;
    }
}