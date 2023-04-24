import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { isNullField, isEmptyOrNullField, decodeJWT } from '../../shared/shared-methods.util';
import { UpdateUserDto } from '../user/dto/request/updateUser.dto';
import { UserDto } from './dto/user.dto';
import { UserServiceInterface } from './interfaces/user.interface';
import { GetUserDto } from './dto/request/getUser.dto';
import { DeleteUserDto } from './dto/request/deleteUser.dto';
import { DateTime } from 'luxon';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/request/changePassword.dto';
import { ChangeEmailDto } from './dto/request/changeEmail.dto';
import { confirmationEmail } from '../../shared/email/confirmationEmail';
import { UserRepositoryInterface } from '../../repositories/user/user.repository.interface';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import { JwtService } from '@nestjs/jwt';
import { JwtDTO } from '../../auth/dto/jwt.dto';
import { constants } from 'perf_hooks';
var momenttz = require('moment-timezone');
const crypto = require("crypto");

@Injectable()
export class UserService implements UserServiceInterface {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
        @Inject('UserRepositoryInterface')
        private readonly userRepository: UserRepositoryInterface,
        @Inject('EventRepositoryInterface')
        private readonly eventRepositoryInterface: EventRepositoryInterface,
        private readonly jwtService: JwtService
    ) { }

    async createUser(user: UserDto): Promise<boolean> {
        const db = await this.conectionRepository.conectionToDb();
        const userCollection = db.collection('Users');

        const existsUsername = await this.userRepository.findUserByUsername(user.username, userCollection);
        if (!isEmptyOrNullField(existsUsername)) {
            throw new BadRequestException(['username#El nombre de usuario ingresado ya está en uso.']);
        }

        user.email = user.email.toLowerCase();
        user.subscriptionType = 'basic';

        const existsEmail = await this.userRepository.findUserByEmail(user.email, userCollection);
        if (!isEmptyOrNullField(existsEmail)) {
            throw new BadRequestException(['email#El email ingresado ya se encuentra registrado.']);
        }

        const saltOrRounds = 12;
        const hash = await bcrypt.hash(user.password, saltOrRounds);
        user.password = hash;

        user.notifications = [];
        return await this.userRepository.createUser(user, userCollection);
    }

    async updateUser(user: UpdateUserDto, jwt: string): Promise<string> {
        const { user_id, ...rest } = user;

        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Users');

        
        if (!isNullField(rest.username)) {
            const existsUsername = await this.userRepository.findUserByUsername(rest.username, collection);
            if (!isEmptyOrNullField(existsUsername)) {
                throw new BadRequestException(['username#El nombre de usuario ingresado ya está en uso.']);
            }
        }

        if (!isNullField(rest.email)) {
            user.email = user.email.toLowerCase();
            const existsEmail = await this.userRepository.findUserByEmail(rest.email, collection);
            if (!isEmptyOrNullField(existsEmail)) {
                throw new BadRequestException(['email#El email ingresado ya se encuentra registrado.']);
            }
        }

        const subscriptionType = decodeJWT(jwt).subscriptionType;
        if (!isEmptyOrNullField(rest.username)) return this.signUser(user_id, rest, subscriptionType, collection);
        return this.updateUserInDB(user_id, rest, collection, jwt);
    }

    async signUser(userId: string, rest, subscriptionType, collection) {
        await this.userRepository.udpateUser(userId, rest, collection)
        return this.jwtService.sign({
            sub: userId,
            username: rest.username,
            subscriptionType: subscriptionType
        } as JwtDTO);
    }

    async updateUserInDB(user_id: string, rest, collection, jwt: string): Promise<string> {
        const isUpdated = await this.userRepository.udpateUser(user_id, rest, collection);

        if (isUpdated) return jwt;

        throw new BadRequestException('No se pudo actualizar el usuario.')
    }

    async getUser(user_id: string): Promise<GetUserDto> {
        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Users');

        const result = await this.userRepository.findUserById(user_id, collection);
        const user = {
            username: result.username,
            name: result.name,
            lastname: result.lastname,
            email: result.email,
            birthday: result.birthday,
            gender: result.gender,
            address: result.address,
            profile_photo: result.profile_photo ? result.profile_photo : null
        } as unknown as GetUserDto;

        return user;
    }

    async deleteUser(user: DeleteUserDto): Promise<boolean> {
        const db = await this.conectionRepository.conectionToDb();
        const eventCollection = db.collection("Events");

        const now_date = momenttz().tz("America/Buenos_Aires").format("YYYY-MM-DD");

        const events = await this.eventRepositoryInterface.getUserInEvent(user.user_id, now_date, eventCollection);

        if (!events.length) return this.validateAndDeleteUser(db, user);

        throw new BadRequestException("El usuario no se puede eliminar ya que es participe de un evento activo.")
    }

    async validateAndDeleteUser(db, user: DeleteUserDto): Promise<boolean> {
        const userCollection = db.collection("Users");

        const getUserResult = await this.userRepository.findUserById(user.user_id, userCollection);

        if (await bcrypt.compare(user.password, getUserResult.password) == false) {
            throw new BadRequestException(
                'La contraseña ingresada es incorrecta.',
                'password',
            );
        }

        const deleteDate = DateTime.now().setZone('America/Buenos_Aires');
        const deletedDate = deleteDate.toISODate();

        return await this.userRepository.deleteUser(user.user_id, deletedDate, userCollection);
    }

    async changePassword(changePassword: ChangePasswordDto): Promise<boolean> {
        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Users');

        const user = await this.userRepository.findUserById(changePassword.user_id, collection);
        if (isEmptyOrNullField(user)) throw new BadRequestException(['generic#El usuario ingresado no existe.']);

        const passwordCorrecta = await bcrypt.compare(changePassword.password, user.password);

        if (passwordCorrecta === false) {
            throw new BadRequestException(['password#La contraseña ingresada no es correcta.']);
        }

        const saltOrRounds = 12;
        const hash = await bcrypt.hash(changePassword.new_password, saltOrRounds);

        await this.userRepository.changePassword(changePassword.user_id, hash, collection);
        await confirmationEmail('la contraseña', 'Se realizó un cambio en la contraseña de su usuario.', user.email, user.name);
        return true;
    }

    async changeEmail(changeEmail: ChangeEmailDto): Promise<boolean> {
        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Users');

        changeEmail.new_email = changeEmail.new_email.toLowerCase();
        const existsEmail = await this.userRepository.findUserByEmail(changeEmail.new_email, collection);
        if (isEmptyOrNullField(existsEmail)) {
            throw new BadRequestException(['email#El email ingresado ya se encuentra registrado.']);
        }

        const user = await this.userRepository.findUserById(changeEmail.user_id, collection);
        if (isEmptyOrNullField(user)) throw new BadRequestException(['generic#El usuario ingresado no existe.']);

        const passwordCorrecta = await bcrypt.compare(changeEmail.password, user.password);

        if (passwordCorrecta === false) {
            throw new BadRequestException(['password#La contraseña ingresada no es correcta.']);
        }

        await this.userRepository.changeEmail(changeEmail.user_id, changeEmail.new_email, collection);
        await confirmationEmail('el email', 'Se realizó un cambio en el mail de su usuario.', user.email, user.name);
        return true;
    }

    async getUsersWithFilter(user: string): Promise<UserDto> {
        const conditions = {
            eliminated_date: { $eq: null },
            $or: [{ name: new RegExp(user, "i") }, { lastname: new RegExp(user, "i") }, { username: new RegExp(user, "i") }]
        };

        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Users');

        return await this.userRepository.getUsersWithFilter(conditions, collection);
    }
}
