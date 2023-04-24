import { ObjectId } from "mongodb";
import { TransacitionDto } from "./transaction.dto";

export class GuestExpensesSummaryDto{
    public user_id: ObjectId;

    public debt: number;
    
    public amountSpent: number;

    public balance: number;

    public transactions: TransacitionDto[];

    constructor(user_id, debt, amountSpent, balance, transactions){
        this.user_id = user_id,
        this.debt = debt,
        this.amountSpent = amountSpent,
        this.balance = balance,
        this.transactions = transactions
    }
}