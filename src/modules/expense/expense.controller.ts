import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExpenseServiceInterface } from './interface/expense.interface';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateSubscribersExpenseDto } from './dto/request/updateSubscribersExpense.dto';
import { GetExpensesSummaryDto } from './dto/response/getExpensesSummary.dto';
import { GetGuestExpensesSummaryDto } from './dto/response/getGuestExpensesSummary.dto';
import { DeleteExpenseDto } from './dto/request/deleteExpense.dto';
import { isEmptyOrNullField } from '../../shared/shared-methods.util';
import { CompleteTransactionDto } from './dto/request/completeTransaction.dto';

@Controller('expense')
@ApiTags('Manejo de gastos')
export class ExpenseController {
    constructor(
        @Inject('ExpenseServiceInterface')
        private expenseServiceInterface: ExpenseServiceInterface) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('createExpense') 
    createExpense(@Req() request: Request, @Body(new ValidationPipe()) expense: ExpenseDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.expenseServiceInterface.createExpense(expense, jwt);
        } 
        catch (err) {
            throw new BadRequestException(err);
        }
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Put('updateExpense')
    updateExpense(@Req() request: Request, @Body(new ValidationPipe()) updateExpense: ExpenseDto): Promise <boolean>{
        try{
            if (isEmptyOrNullField(updateExpense.expense_id)) throw new BadRequestException(['expense_id#El id del gasto no puede ser nulo']);
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.expenseServiceInterface.updateExpense(updateExpense, jwt)
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required: true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @ApiQuery({name: 'expense_id', required: true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getExpense')
    getExpense(@Req() request: Request, @Query('event_id') event_id: string, @Query('expense_id') expense_id: string): Promise<ExpenseDto>{
    try {
        if (isEmptyOrNullField(expense_id)) throw new BadRequestException(['expense_id#El id del gasto no puede ser nulo']);
        if (isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede ser nulo']);
        const jwt = request.headers['authorization'].split(' ')[1];
        return this.expenseServiceInterface.getExpense(event_id, expense_id, jwt);
    } catch (err) {
        throw new BadRequestException(err);
    }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required:true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getEventExpenses')
    getEventExpenses(@Req() request: Request, @Query('event_id') event_id: string): Promise <ExpenseDto[]>{
        try{
            if (isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede ser nulo']);
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.expenseServiceInterface.getEventExpenses(event_id, jwt);
        } catch (err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('updateSubscribers') 
    updateSubscribers(@Req() request: Request, @Body(new ValidationPipe()) updateSubscribers: UpdateSubscribersExpenseDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.expenseServiceInterface.updateSubscribers(updateSubscribers, jwt);
        } 
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required:true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('splitExpenses')
    splitExpenses(@Req() request: Request, @Query('event_id') event_id: string): Promise <boolean>{
        try{
            if (isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede ser nulo']);
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.expenseServiceInterface.splitExpenses(event_id, jwt);
        } catch (err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required:true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getExpensesSummary')
    getExpensesSummary(@Req() request: Request, @Query('event_id') event_id: string): Promise <GetExpensesSummaryDto>{
        try{
            if (isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede ser nulo']);
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.expenseServiceInterface.getExpensesSummary(event_id, jwt);
        } catch (err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({name: 'event_id', required:true, example: '6317c1a96c3c794b8d3663ed', type: String})
    @Get('getExpensesSummaryXGuest')
    async getExpensesSummaryXGuest(@Req() request: Request, @Query('event_id') event_id: string): Promise <GetGuestExpensesSummaryDto>{
        try{
            if (isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede ser nulo']);
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.expenseServiceInterface.getExpensesSummaryXGuest(event_id, jwt);
        } catch (err){
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('deleteExpense')
    deleteExpense(@Req() request: Request, @Body(new ValidationPipe()) deleteExpense: DeleteExpenseDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.expenseServiceInterface.deleteExpense(deleteExpense, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('completeTransaction') 
    completeTransaction(@Req() request: Request, @Body(new ValidationPipe()) completeTransaction: CompleteTransactionDto): Promise<boolean> {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return this.expenseServiceInterface.completeTransaction(completeTransaction, jwt);
        } 
        catch (err) {
            throw new BadRequestException(err);
        }
    }
}
