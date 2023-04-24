import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ExpenseServiceInterface } from './interface/expense.interface';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { ExpenseDto } from './dto/expense.dto';
import { ObjectId } from 'mongodb';
import { decodeJWT, isEmptyObject, isEmptyOrNullField, isNullField } from '../../shared/shared-methods.util';
import { EventDto } from '../event/dto/event.dto';
import { UpdateSubscribersExpenseDto } from './dto/request/updateSubscribersExpense.dto';
import { SubscriberXExpenseDto } from './dto/subscriberXExpense.dto';
import { EventExpensesSummaryDto } from './dto/eventExpensesSummary.dto';
import { GuestExpensesSummaryDto } from './dto/guestExpensesSummary.dto';
import { TransacitionDto } from './dto/transaction.dto';
import { GetExpensesSummaryDto } from './dto/response/getExpensesSummary.dto';
import { GetGuestExpensesSummaryDto } from './dto/response/getGuestExpensesSummary.dto';
import { DeleteExpenseDto } from './dto/request/deleteExpense.dto';
import { EventService } from '../event/event.service';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import { CompleteTransactionDto } from './dto/request/completeTransaction.dto';

@Injectable()
export class ExpenseService implements ExpenseServiceInterface{
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
        private readonly eventService: EventService,
        @Inject('EventRepositoryInterface')
        private readonly eventRepositoryInterface: EventRepositoryInterface
        ) {}
    
    async createExpense(expense: ExpenseDto, jwt: string): Promise<boolean>{
      const permissions = await this.eventService.getAllPermissionsInEvent(jwt, expense.event_id.toString());
      if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if (permissions.role_permissions.CREATE_EXPENSE !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
      
      if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede agregar un transporte a evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
      
      const user_id = decodeJWT(jwt).sub;

      expense.event_id = new ObjectId(expense.event_id);

      if (isEmptyOrNullField(expense.in_charge)) expense.in_charge = new ObjectId(user_id);
      else expense.in_charge = new ObjectId(expense.in_charge);
        
      var crypto = require("crypto");
      expense.expense_id = crypto.randomBytes(12).toString('hex');
      expense.amount = Number(expense.amount);
      expense.total_quantity = 0;
      
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      return await this.eventRepositoryInterface.createExpense(expense.event_id, expense, collection);
    }

    async updateExpense(updateExpense: ExpenseDto, jwt: string) : Promise<boolean> {
      const permissions = await this.eventService.getAllPermissionsInEvent(jwt, updateExpense.event_id.toString());
      if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if (permissions.role_permissions.UPDATE_EXPENSE !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);

      if (permissions.state == 'canceled' || permissions.state == 'finalized')
        throw new BadRequestException(['generic#No se puede modificar un transporte de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
      
      const user_id = decodeJWT(jwt).sub;
      
      if (isEmptyOrNullField(updateExpense.in_charge)) updateExpense.in_charge = new ObjectId(user_id);
      else updateExpense.in_charge = new ObjectId(updateExpense.in_charge);

      updateExpense.amount = Number(updateExpense.amount);

      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      return await this.eventRepositoryInterface.updateExpense(updateExpense.event_id, updateExpense, updateExpense.expense_id , collection);
    }

    async getEventExpenses(event_id: string, jwt:string): Promise <ExpenseDto[]>{
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');
      
      const event: EventDto = await this.eventRepositoryInterface.getEventById(event_id, collection);
      
      if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#El evento ingresado no existe.']);
      
      const eventExpenses = event.expenses;
      
      if (isEmptyOrNullField(eventExpenses)) throw new BadRequestException(['generic#El evento no cuenta con gastos registrados.']);
      
      const user_id = decodeJWT(jwt).sub;

      let expenses: ExpenseDto[] = [];
      for (const expense of eventExpenses) {
        const exp = {
          expense_id: expense.expense_id,
          name: expense.name,
          description: expense.description,
          in_charge: expense.in_charge,
          amount: expense.amount,
          quantifiable: expense.quantifiable,
          total_quantity: expense.total_quantity,
          subscribers: expense.subscribers ? expense.subscribers : [],
          isOwn: expense.in_charge.equals(new ObjectId(user_id))
        } as ExpenseDto;
        expenses.push(exp);
      }
  
      return expenses;
    }

    async getExpense(event_id: string, expense_id: string, jwt: string): Promise<ExpenseDto>{
      const user_id = decodeJWT(jwt).sub;
      
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      return await this.eventRepositoryInterface.getExpense(event_id, expense_id, user_id, collection);
    }

    async updateSubscribers(updateSubscribers: UpdateSubscribersExpenseDto, jwt: string): Promise<boolean> {
      const permissions = await this.eventService.getAllPermissionsInEvent(jwt, updateSubscribers.event_id.toString());
      if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if (permissions.role_permissions.UPDATE_EXPENSE !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.'])

      if (permissions.state == 'canceled' || permissions.state == 'finalized')
        throw new BadRequestException(['generic#No se puede modificar los suscriptores de transporte de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
      
      let expense: ExpenseDto = await this.getExpense(updateSubscribers.event_id, updateSubscribers.expense_id, jwt);

      let subcribers = [];
      if (expense){
        expense.total_quantity = 0;
        if (expense.quantifiable == true) {
          updateSubscribers.subscribers.forEach(subscriber => {
            if (isEmptyOrNullField(subscriber.quantity)) throw new BadRequestException(['generic#Debe ingresar una cantidad a consumir para todos los usuarios.']);

            subscriber = new SubscriberXExpenseDto(new ObjectId(subscriber.user_id), subscriber.quantity);
            subcribers.push(subscriber);
            expense.total_quantity += subscriber.quantity;
          });
        }
        else{
          updateSubscribers.subscribers.forEach(subscriber => {
            subscriber = new SubscriberXExpenseDto(new ObjectId(subscriber.user_id), 1);
            subcribers.push(subscriber);
            expense.total_quantity += 1;
          });
        }
        expense.subscribers = subcribers;
      }
      else{
        throw new BadRequestException(['generic#El gasto ingresado no existe.']);
      }

      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      return await this.eventRepositoryInterface.updateExpenseSubscribers(updateSubscribers.event_id, expense, updateSubscribers.expense_id, collection);
    }

    async splitExpenses(event_id: string, jwt: string) : Promise<boolean>{
      const permissions = await this.eventService.getAllPermissionsInEvent(jwt, event_id);
      if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if (permissions.role_permissions.SPLIT_EXPENSE !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.'])

      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      const event = await this.eventRepositoryInterface.getExpenses(event_id, collection);

      const expenses = event[0].expenses;
      
      if (isNullField(expenses) || expenses?.length == 0) throw new BadRequestException(['generic#No se encuentran gastos registrados.']);

      let expensesSummary = new EventExpensesSummaryDto();
      expensesSummary.total = 0;

      //se recorren los gastos del evento
      for (const expense of expenses) {
        if (isEmptyOrNullField(expense.subscribers) || expense.subscribers?.length == 0) throw new BadRequestException(['generic#Todos los gastos deben tener suscriptores.']);
        expensesSummary.total += expense.amount;

        let guestExpensesSummary: GuestExpensesSummaryDto;
        //busco si ya está el resumen del encargado del gasto
        guestExpensesSummary = expensesSummary.summaryXGuest.find((x) => x.user_id.equals(expense.in_charge));

        //si no está lo creo y lo agrego
        if (isNullField(guestExpensesSummary)){
          guestExpensesSummary = new GuestExpensesSummaryDto(expense.in_charge, 0, expense.amount, expense.amount, []);
          expensesSummary.summaryXGuest.push(guestExpensesSummary);
        }
        //si ya está le sumo lo gastado y recalculo su balance
        else{
          guestExpensesSummary.amountSpent += expense.amount;
          guestExpensesSummary.balance = guestExpensesSummary.amountSpent - guestExpensesSummary.debt;
        }

        //recorro los suscriptores del gasto
        for (const subscriber of expense.subscribers) {
          let guestExpensesSummary2: GuestExpensesSummaryDto;
          //busco si ya está el resumen de cada suscriptor
          guestExpensesSummary2 = expensesSummary.summaryXGuest.find((x) => x.user_id.equals(subscriber.user_id));

          //calculo lo que tiene que pagar
          let debt = subscriber.quantity / expense.total_quantity * expense.amount;

          //si no está lo agrego
          if (isNullField(guestExpensesSummary2)){
            guestExpensesSummary2 = new GuestExpensesSummaryDto(new ObjectId(subscriber.user_id), debt, 0, -debt, []);
            expensesSummary.summaryXGuest.push(guestExpensesSummary2);
          }
          //si ya está recalculo su total a pagar y su balance
          else{
            guestExpensesSummary2.debt += debt;
            guestExpensesSummary2.balance = guestExpensesSummary2.amountSpent - guestExpensesSummary2.debt;
          }
        }
      }

      //se ordenan los invitados de menor a mayor segun sus balances
      expensesSummary.summaryXGuest.sort((guest1, guest2) => guest1.balance - guest2.balance);

      let i = 0;
      let j = expensesSummary.summaryXGuest?.length - 1;
      let owes;

      const copySummarryXGuest = JSON.parse(JSON.stringify(expensesSummary.summaryXGuest));

      while (i < j) {
        owes = Math.min(-(copySummarryXGuest[i].balance), copySummarryXGuest[j].balance);
        copySummarryXGuest[i].balance += owes;
        copySummarryXGuest[j].balance -= owes;

        var crypto = require("crypto");
        const transaction_id = crypto.randomBytes(12).toString('hex');

        const transaction = new TransacitionDto(transaction_id, new ObjectId(copySummarryXGuest[i].user_id), new ObjectId(copySummarryXGuest[j].user_id), owes)
        expensesSummary.transactions.push(transaction);

        if (copySummarryXGuest[i].balance === 0) {
          i++;
        }

        if (copySummarryXGuest[j].balance === 0) {
          j--;
        }
      }

      return await this.eventRepositoryInterface.createExpenseSummary(event_id, expensesSummary, collection);
    }

    async getExpensesSummary(event_id: string, jwt :string) : Promise<GetExpensesSummaryDto>{
      const permissions = await this.eventService.getAllPermissionsInEvent(jwt, event_id);
      if (isEmptyObject(permissions)) throw new BadRequestException(['generic#El evento ingresado no existe.']);
      if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
  
      if (permissions.role_permissions.VIEW_TOTAL_EXPENSES_REVIEW !== true) return undefined;
      return this.generateExpensesSummaryMongo(event_id);
    }

    private async generateExpensesSummaryMongo(event_id){
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      const expensesSummary = await this.eventRepositoryInterface.getExpensesSummary(event_id, collection);

      if (expensesSummary[0].summary.transactions == null) return undefined;

      if (expensesSummary[0].expenses?.length == 0){
        return await this.eventRepositoryInterface.updateExpenseSummary(event_id, collection);
      }

      return expensesSummary[0].summary;
    }

    async getExpensesSummaryXGuest(event_id: string, jwt: string) : Promise<GetGuestExpensesSummaryDto>{
      const permissions = await this.eventService.getAllPermissionsInEvent(jwt, event_id);
      if (isEmptyObject(permissions)) throw new BadRequestException(['generic#El evento ingresado no existe.']);
      if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
  
      if (permissions.role_permissions.VIEW_EXPENSES_REVIEW !== true) return undefined;
      
      const user_id = decodeJWT(jwt).sub;

      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      return await this.eventRepositoryInterface.getExpensesSummaryXGuest(event_id, user_id, collection);
    }

    async deleteExpense(deleteExpense: DeleteExpenseDto, jwt: string): Promise<boolean> {
      const permissions = await this.eventService.getAllPermissionsInEvent(jwt, deleteExpense.event_id);
      if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if (permissions.role_permissions.DELETE_EXPENSE !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);

      if (permissions.state == 'canceled' || permissions.state == 'finalized')
        throw new BadRequestException(['generic#No se puede eliminar un transporte de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
      
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      return await this.eventRepositoryInterface.deleteExpense(deleteExpense.event_id, deleteExpense.expense_id, collection);
    }

    async completeTransaction(completeTransaction: CompleteTransactionDto, jwt: string): Promise<boolean>{
      const permissions = await this.eventService.getAllPermissionsInEvent(jwt, completeTransaction.event_id);
      if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
      if (permissions.role_permissions.COMPLETE_TRANSACTION !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);

      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      return await this.eventRepositoryInterface.completeTransaction(completeTransaction, collection);
    }
}
