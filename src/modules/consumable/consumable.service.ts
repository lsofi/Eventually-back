import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { decodeJWT, isDateGreatherDateNow, isEmptyOrNullField, isNullField } from '../../shared/shared-methods.util';
import { EventDto } from '../event/dto/event.dto';
import { EventService } from '../event/event.service';
import { ConsumableDto } from './dto/consumable.dto';
import { DeleteConsumableDto } from './dto/request/deleteConsumable.dto';
import { SubscribeToConsumableDto } from './dto/request/subscribeToConsumable.dto';
import { UnSubscribeToConsumableDto } from './dto/request/unsubscribeToConsumable.dto';
import { SubscriberXConsumibleDto } from './dto/subscriberXConsumible.dto';
import { ConsumableServiceInterface } from './interface/consumable.interface';

@Injectable()
export class ConsumableService implements ConsumableServiceInterface{
  constructor(
    @Inject('ConectionRepositoryInterface')
    private readonly conectionRepository: ConectionRepositoryInterface,
    @Inject('EventService')
    private readonly eventService: EventService,
    @Inject('EventRepositoryInterface')
    private readonly eventRepositoryInterface: EventRepositoryInterface
    ) {}


  async createConsumable(consumable: ConsumableDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventService.getAllPermissionsInEvent(jwt,consumable.event_id.toString());

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede agregar un consumible a un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (permissions.role_permissions.CREATE_CONSUMABLE !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.'])

    consumable.event_id = new ObjectId(consumable.event_id);

    var crypto = require("crypto");
    consumable.consumable_id = crypto.randomBytes(12).toString('hex');

    let db;
    db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.createConsumable(consumable.event_id, consumable, collection);
  }
  
  async deleteConsumable(deleteConsumable: DeleteConsumableDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventService.getAllPermissionsInEvent(jwt, deleteConsumable.event_id );

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede eliminar un consumible de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (permissions.role_permissions.DELETE_CONSUMABLE !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);

    let db, result;  
    db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.deleteConsumable(deleteConsumable.event_id, deleteConsumable.consumable_id, collection);
  }

  async getEventConsumables(event_id: string, jwt:string): Promise<ConsumableDto[]> {
    const permissions = await this.eventService.getAllPermissionsInEvent(jwt, event_id);
    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if(permissions.role_permissions.VIEW_CONSUMABLES !== true) return undefined;

    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    const event: EventDto = await this.eventRepositoryInterface.getEventById(event_id, collection);

    if (isEmptyOrNullField(event))
      throw new BadRequestException(['generic#El evento ingresado no existe.']);

    const eventConsumables = event.consumables;
    if (isEmptyOrNullField(eventConsumables))
      throw new BadRequestException(['generic#El evento no cuenta con consumibles registrados.']);

    let consumables: ConsumableDto[] = [];
    for (const consumable of eventConsumables) {
      const con = {
        consumable_id: consumable.consumable_id,
        name: consumable.name,
        description: consumable.description,
        subscribers: consumable.subscribers ? consumable.subscribers: []
      } as ConsumableDto;
      consumables.push(con);
    }

    return consumables;
  }

  async getConsumable(event_id: string, consumable_id: string): Promise<ConsumableDto> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.getConsumable(event_id, consumable_id, collection);  
  }

  async subscribeToConsumable(subscribeToConsumable: SubscribeToConsumableDto, jwt: string): Promise<boolean>{
    const permissions = await this.eventService.getAllPermissionsInEvent(jwt, subscribeToConsumable.event_id);
    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if(permissions.role_permissions.SUBSCRIBE_TO_CONSUMABLE !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
    
    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede suscribirse a un consumible de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
    
    const consumable = await this.getConsumable(subscribeToConsumable.event_id, subscribeToConsumable.consumable_id);
    const user_id = decodeJWT(jwt).sub;
    let subscriber;

    if (consumable){
      if (consumable.quantifiable == true && isEmptyOrNullField(subscribeToConsumable.quantity)) throw new BadRequestException(['consumable.quantity#Debe ingresar una cantidad a consumir.']);
      if (consumable.subscribers) {
        subscriber = consumable.subscribers.find((x) => new ObjectId(user_id).equals(x.user_id));
        if (!isNullField(subscriber)) throw new BadRequestException(['generic#El usuario ingresado ya está suscripto al consumible.']);
      }
    }
    else{
      throw new BadRequestException(['generic#El consumible ingresado no existe.']);
    }

    if (consumable.quantifiable == true){
      subscriber = new SubscriberXConsumibleDto(new ObjectId(user_id), subscribeToConsumable.quantity);
    }
    else{
      subscriber = new SubscriberXConsumibleDto(new ObjectId(user_id), 1);
    }

    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.subscribeToConsumable(subscribeToConsumable.event_id, subscribeToConsumable.consumable_id, subscriber, collection);
  }
  
  async unsubscribeToConsumable(unsubscribeToConsumable: UnSubscribeToConsumableDto, jwt: string): Promise<boolean>{
    const permissions = await this.eventService.getAllPermissionsInEvent(jwt, unsubscribeToConsumable.event_id);
    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if(permissions.role_permissions.UNSUBSCRIBE_TO_CONSUMABLE !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
    
    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede desuscribirse a un consumible de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
    
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.unsubscribeToConsumable(unsubscribeToConsumable.event_id, unsubscribeToConsumable.consumable_id, unsubscribeToConsumable.user_id, collection);
  }

  async updateConsumable(updateConsumable: ConsumableDto, jwt: string) : Promise<boolean>{
    const permissions = await this.eventService.getAllPermissionsInEvent(jwt,updateConsumable.event_id.toString());
    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (permissions.role_permissions.UPDATE_CONSUMABLE !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.'])

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede modificar un consumible de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);
    
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.updateConsumable(updateConsumable.event_id, updateConsumable.name,updateConsumable.description, updateConsumable.quantifiable,  updateConsumable.consumable_id, collection);
  }
}
