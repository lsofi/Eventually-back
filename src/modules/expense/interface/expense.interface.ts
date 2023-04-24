import { EventExpensesSummaryDto } from "../dto/eventExpensesSummary.dto";
import { ExpenseDto } from "../dto/expense.dto";
import { CompleteTransactionDto } from "../dto/request/completeTransaction.dto";
import { DeleteExpenseDto } from "../dto/request/deleteExpense.dto";
import { UpdateSubscribersExpenseDto } from "../dto/request/updateSubscribersExpense.dto";
import { GetExpensesSummaryDto } from "../dto/response/getExpensesSummary.dto";
import { GetGuestExpensesSummaryDto } from "../dto/response/getGuestExpensesSummary.dto";

export interface ExpenseServiceInterface {
    createExpense(expense: ExpenseDto, jwt: string): Promise<boolean>;
    deleteExpense(deleteExpense: DeleteExpenseDto, jwt: string): Promise<boolean>;
    updateExpense(updateExpense: ExpenseDto, jwt: string) : Promise<boolean>;
    getEventExpenses(event_id: string, jwt: string): Promise <ExpenseDto[]>;
    getExpense(event_id: string, expense_id: string, jwt: string): Promise<ExpenseDto>;
    updateSubscribers(updateSubscribers: UpdateSubscribersExpenseDto, jwt: string): Promise<boolean>;
    splitExpenses(event_id: string, jwt: string) : Promise<boolean>;
    getExpensesSummary(event_id: string, jwt: string) : Promise<GetExpensesSummaryDto>;
    getExpensesSummaryXGuest(event_id: string, jwt: string) : Promise<GetGuestExpensesSummaryDto>;
    completeTransaction(completeTransaction: CompleteTransactionDto, jwt: string): Promise<boolean>;
}