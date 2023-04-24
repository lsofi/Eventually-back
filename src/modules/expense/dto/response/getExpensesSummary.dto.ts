import { GetGuestExpensesSummaryDto } from "./getGuestExpensesSummary.dto";
import { GetTransacitionDto } from "./getTransaction.dto";

export class GetExpensesSummaryDto{
    public total: number;

    public debtOfEach: number;

    public summaryXGuest: GetGuestExpensesSummaryDto[];
    
    public transactions: GetTransacitionDto[];

    constructor(){
        this.total = 0;
        this.debtOfEach = 0;
        this.summaryXGuest = [];
        this.transactions = [];
    }
}