import { ObjectId } from "mongodb";

export class SubscriberInConsumableDTO {
    public user_id: ObjectId;
    public name: string;
    public lastname: string;
    public username: string;
    public quantity?: number;
  }