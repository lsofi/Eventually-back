import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { NotificationDto } from "src/modules/gateway/dto/notifications.dto";
import { ConectionRepositoryInterface } from "../../conection-db/conection.repository,interface";
import { UserDto } from "../../modules/user/dto/user.dto";
import { UserRepositoryInterface } from "./user.repository.interface";

@Injectable()
export class UserRepository implements UserRepositoryInterface {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
    ) { }


    async findUserByUsername(username: string, userCollection){
        try {
            const user = await userCollection.findOne({
                username: username,
                eliminated_date: { $eq: null }
            });

            return user;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async findUserByEmail(email: string, userCollection){
        try {
            const user = await userCollection.findOne({
                email: email,
                eliminated_date: { $eq: null }
            });

            return user;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async createUser(user: UserDto, userCollection): Promise<boolean> {
        try {
            const insertUser = await userCollection.insertOne(user);
            return true;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async udpateUser(user_id: string, user, userCollection): Promise<boolean> {
        try {
            const result = await userCollection.updateOne(
                { _id: new ObjectId(user_id) },
                { $set: user }
            )

            if (result.matchedCount !== 0) return true;
            return false;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async findUserById(user_id: string, userCollection) {
        try {
            return await userCollection.findOne({
                _id: new ObjectId(user_id)
            })
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteUser(user_id, deletedDate, userCollection): Promise<boolean> {
        try {
            const deleteUserResult = await userCollection.updateOne(
                { _id: new ObjectId(user_id) },
                {
                    $set: {
                        eliminated_date: deletedDate
                    }
                }
            )
            if (deleteUserResult.matchedCount !== 0) return true;
            return false;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async changePassword(user_id:string, password:string, userCollection){
        try{
            await userCollection.updateOne(
                {_id: new ObjectId(user_id)},
                { $set: {password: password}}
            )
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async changeEmail(user_id:string, email:string, userCollection){
        try{
            await userCollection.updateOne(
                { _id: new ObjectId(user_id) },
                { $set: {email: email} },
            )
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async addNotificationToUser(user_id: string, notification: NotificationDto, userCollection){
        try{
            const result = await userCollection.updateOne(
                {_id: new ObjectId(user_id)},
                { $push: {notifications: notification}}
            )
        } catch(err){
            throw new BadRequestException(err);
        }
    }
    
    async getUsersWithFilter(conditions, userCollection){
        try {
            const users = await userCollection.find(conditions).project({name:1, lastname:1, username:1, small_photo:1}).toArray();
            return users;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async registerUserPremium(user_id, userCollection){
        try {
            const result = await userCollection.updateOne(
                { _id: user_id },
                { $set: { subscriptionType: 'premium' } }
            )
            if (result.matchedCount !== 0) return true;
            return false;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async cancelUserPremium(user_id, userCollection){
        try {
            const result = await userCollection.updateOne(
                { _id: user_id },
                { $set: { subscriptionType: 'basic' } }
            )
            if (result.matchedCount !== 0) return true;
            return false;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getUserTemplates(user_id, userCollection){
        try {
            const templates = await userCollection.find({_id: new ObjectId(user_id)}).project({templates:1, _id: 0}).toArray();
            return templates[0];
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async createTemplateByUser(user_id, template, userCollection){
        try {
            const result = await userCollection.updateOne(
                { _id: new ObjectId(user_id) },
                { $push: { templates: template } }
            )
            if (result.matchedCount !== 0) return true;
            return false;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
}