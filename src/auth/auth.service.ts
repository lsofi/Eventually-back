import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConectionRepositoryInterface } from '../conection-db/conection.repository,interface';
import { AuthDto } from './dto';
import { JwtDTO } from './dto/jwt.dto';
import * as bcrypt from 'bcrypt';
import { ForgottenPassword } from './interface/forgottenpassword.interface';
import { sendEmailForgottenPassword } from '../shared/email/forgottenPassword';
import { UserDto } from '../modules/user/dto/user.dto';
import { generatePasswordGoogle } from '../shared/email/generatePasswordGoogle';
import { decodeJWT } from 'src/shared/shared-methods.util';
import { ObjectId } from 'mongodb';

@Injectable()
export class AuthService {
  constructor(
    @Inject('ConectionRepositoryInterface')
    private readonly conectionRepository: ConectionRepositoryInterface,

    private readonly jwtService: JwtService,
  ) {}

  async signinLocal(dto: AuthDto) {

    let user;
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Users');
    user = await collection.find({ email: dto.email, eliminated_date: {$eq: null}}).toArray();

    if (user?.length === 0) {
      throw new UnauthorizedException(
        `No se encontró usuario con el email ingresado ${dto.email}.`,
      );
    }

    const passwordCorrecta = await bcrypt.compare(dto.password, user[0].password);
    
    if (passwordCorrecta === false){
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return this.signUser(
      user[0]._id,
      user[0].username,
      user[0].subscriptionType
    );
  }

  async updateJwt(jwt){
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Users');

    const user_id = decodeJWT(jwt).sub;

    const user = await collection.findOne({_id: new ObjectId(user_id)});

    return this.signUser(user._id, user.username, user.subscriptionType);
  }

  signUser(userId: string, username: string, subscriptionType: string) {
    return this.jwtService.sign({
      sub: userId,
      username: username,
      subscriptionType: subscriptionType
    } as JwtDTO);
  }

  async forgotPassword(email){
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Users');
    const forgottenPasswordCollection = db.collection('Forgotten Password');

    const user = await collection.find({ email: email}).toArray();
    if(user?.length === 0) throw new BadRequestException(['generic#No se encontró el email ingresado.'])

    const tokenModel = await this.createForgottenPasswordToken(email, forgottenPasswordCollection);
    if(tokenModel && tokenModel.newPasswordToken){
      const mail = await sendEmailForgottenPassword(email, tokenModel.newPasswordToken);
      return mail;
    }
  }

  async createForgottenPasswordToken(email:string, forgottenPasswordCollection): Promise<ForgottenPassword>{
    const password = await forgottenPasswordCollection.find({ email: email}).toArray();
    // if(password && ((new Date().getTime() - password.timestamp.getTime()) / 60000 < 15)){
    //   throw new BadRequestException('NI la mas remota idea de que hace esto la verdad')
    // }
    const passModel = {
      email: email,
      newPasswordToken: (Math.floor(Math.random() * (9000000)) + 1000000).toString(), //Generate 7 digits number,
      timestamp: new Date()
    } as ForgottenPassword;

    if(password?.length === 0){
      const fotgottenPasswordDocument = await forgottenPasswordCollection.insert(passModel);
      console.log(fotgottenPasswordDocument);
    } else{
      const forgottenPasswordDocument = await forgottenPasswordCollection.updateOne(
        {email: email},
        {$set: passModel}
      )
      console.log(forgottenPasswordDocument);
    }
            
  return passModel;
  }

  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Users');
    const user = await collection.find({ email: email }).toArray();

    if (user?.length === 0) throw new BadRequestException(['generic#No se encontró el mail ingresado.'])

    const saltOrRounds = 12;
    user[0].password = await bcrypt.hash(newPassword, saltOrRounds);

    const result = await collection.updateOne(
      { email: email },
      { $set: { password: user[0].password } },
    );
    if (result.modifiedCount !== 0) return true;
    return false;
  }

  async getForgottenPasswordModel(newPasswordToken:string): Promise<ForgottenPassword>{
    const db = await this.conectionRepository.conectionToDb();
    const forgottenPasswordCollection = db.collection('Forgotten Password');

    const passwordToken = await forgottenPasswordCollection.find({ newPasswordToken: newPasswordToken}).toArray();
    console.log(passwordToken);
    return passwordToken[0];
  }

  async deleteForgottenPasswordModel(newPasswordToken:string): Promise<boolean>{
    const db = await this.conectionRepository.conectionToDb();
    const forgottenPasswordCollection = db.collection('Forgotten Password');
    
    const deleted = await forgottenPasswordCollection.deleteOne({newPasswordToken: newPasswordToken });
    console.log(deleted);
    return true;
  }

  async validateUser(user:UserDto, password: string){
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Users');
    try{
      const existsUser = await collection.find({ email: user.email, eliminated_date: {$eq: null}}).toArray();
      if(existsUser?.length === 0){
        await generatePasswordGoogle(user.email, user.username, password);
        user.notifications = [];
          const userInBd = await collection.insertOne(user);
          const userInserted = {
            _id: userInBd.insertedId,
            username: user.username
          } as UserDto;
          return userInserted;
      } else{
        const user = {
          _id: existsUser[0]._id,
          username: existsUser[0].username
        } as UserDto;
        return user;
      }
    } catch(err){
      throw new BadRequestException(err);
    }
  }
}
