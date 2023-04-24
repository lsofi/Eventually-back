import { ObjectId } from "mongodb";
import { NotificationDto } from "src/modules/gateway/dto/notifications.dto";
import { UserDto } from "../../modules/user/dto/user.dto";

export interface UserRepositoryInterface {
    findUserByUsername(username: string, userCollection);
    findUserByEmail(email: string | ObjectId, userCollection);
    findUserById(user_id: string | ObjectId, userCollection);
    createUser(user: UserDto, userCollection): Promise<boolean>;
    udpateUser(user_id: string, user, userCollection): Promise<boolean>;
    deleteUser(user_id:  string, deletedDate, userCollection): Promise<boolean>;
    changePassword(user_id:string, password:string, userCollection);
    changeEmail(user_id:string, email:string, userCollection);
    addNotificationToUser(user_id: string | ObjectId, notification: NotificationDto, userCollection);
    getUsersWithFilter(conditions, userCollection);
    registerUserPremium(user_id: ObjectId, userCollection);
    cancelUserPremium(user_id: ObjectId, userCollection);
    getUserTemplates(user_id, userCollection);
    createTemplateByUser(user_id, template, userCollection);
}