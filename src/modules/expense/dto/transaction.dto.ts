import { ObjectId } from "mongodb";

export class TransacitionDto{
    public transaction_id: string;

    public origin: ObjectId;

    public recipient: ObjectId;

    public amount: number;

    public complete: boolean;

    constructor(transaction_id, origin, recipient, amount){
        this.transaction_id = transaction_id;
        this.origin = origin;
        this.recipient = recipient;
        this.amount = amount;
        this.complete = false;
    }
}