import { UpdateUserDto } from "../dto/request/updateUser.dto";
import { GetUserDto } from "../dto/request/getUser.dto";
import { UserDto } from "../dto/user.dto";
import { DeleteUserDto } from "../dto/request/deleteUser.dto";
import { ChangePasswordDto } from "../dto/request/changePassword.dto";
import { ChangeEmailDto } from "../dto/request/changeEmail.dto";

export interface UserServiceInterface {
    updateUser(user: UpdateUserDto, jwt:string): Promise<string>;
    createUser(user: UserDto): Promise<boolean>;
    getUser(user_id: string): Promise<GetUserDto>;
    deleteUser(user: DeleteUserDto): Promise<boolean>;
    changePassword(changePassword: ChangePasswordDto) : Promise<boolean>;
    changeEmail(changeEmail: ChangeEmailDto) : Promise<boolean>;
    getUsersWithFilter(user: string): Promise<UserDto>;
}