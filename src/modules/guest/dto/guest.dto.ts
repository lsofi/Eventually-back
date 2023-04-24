import { ObjectId } from "mongodb";

export class GuestDto {
  public name: string;
  public lastname: string;
  public username: string;
  public photo?: string;
  public response: string;
  public user_id: ObjectId;
  accepted?: boolean;
  public email: string;
  public permissions?;
}
