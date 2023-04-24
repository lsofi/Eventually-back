import { ObjectId } from "mongodb";

export class SubscriberInExpenseDTO {
    public user_id: ObjectId;
    public name: string;
    public lastname: string;
    public username: string;
    public quantity?: number;
    public small_photo?: string;
  }