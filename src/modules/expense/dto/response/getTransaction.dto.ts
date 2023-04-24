import { SubscriberInExpenseDTO } from "./subscriberInExpense.dto";

export class GetTransacitionDto{
    public origin: SubscriberInExpenseDTO;

    public recipient: SubscriberInExpenseDTO;

    public amount: number;

    public complete: boolean;

    constructor(origin, recipient, amount, complete){
        this.origin = origin;
        this.recipient = recipient;
        this.amount = amount;
        this.complete = complete;
    }
}