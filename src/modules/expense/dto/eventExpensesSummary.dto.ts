import { GuestExpensesSummaryDto } from "./guestExpensesSummary.dto";
import { TransacitionDto } from "./transaction.dto";

export class EventExpensesSummaryDto{
    public total: number;

    public debtOfEach: number;

    public summaryXGuest?: GuestExpensesSummaryDto[];
    
    public transactions: TransacitionDto[];

    constructor(){
        this.total = 0;
        this.debtOfEach = 0;
        this.summaryXGuest = [];
        this.transactions = [];
    }
}