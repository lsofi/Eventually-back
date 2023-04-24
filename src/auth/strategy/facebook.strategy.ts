import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile } from "passport";
import {Strategy} from 'passport-facebook';
import { UserDto } from "../../modules/user/dto/user.dto";

require('dotenv').config();
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook'){
    constructor(){
        super({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL_STG,
            scope: 'email',
            profileFields: ['emails', 'name']
        })
    }

    async validate(profile: Profile, done: (err:any, user:any, info?:any) => void): Promise<any>{
        const {name, emails, photos} = profile;
        const user = {
            username: 'probando1',
            email: emails[0].value,
            profile_photo: Buffer.from(photos[0].value).toString('base64'),
            name: name.givenName,
            lastname: name.familyName,
            eliminated_date: null
        } as unknown as UserDto;
        console.log(user);
    }
}