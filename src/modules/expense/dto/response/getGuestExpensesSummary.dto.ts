import { GetTransacitionDto } from "./getTransaction.dto";
import { SubscriberInExpenseDTO } from "./subscriberInExpense.dto";

export class GetGuestExpensesSummaryDto{
    public guest: SubscriberInExpenseDTO;

    public debt: number;
    
    public amountSpent: number;

    public balance: number;

    public transactions: GetTransacitionDto[];

    constructor(){
    }
}