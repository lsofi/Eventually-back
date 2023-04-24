import { ObjectId } from "mongodb";

export class UserInEventDTO {
  public user_id: ObjectId;
  public name: string;
  public lastname: string;
  public username: string;
  public profile_photo: string;
  public email: string;
  permissions?: any;
}
