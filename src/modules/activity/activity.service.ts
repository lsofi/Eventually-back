import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { decodeJWT, isEmptyOrNullField, isNotValidDate1GreatherDate2} from '../../shared/shared-methods.util';
import { EventService } from '../event/event.service';
import { UserService } from '../user/user.service';
import { ActivityDto } from './dto/activity.dto';
import { CompleteActivityDto } from './dto/request/completeActivity.dto';
import { DeleteActivityDto } from './dto/request/deleteActivity.dto';
import { DeleteInChargeDto } from './dto/request/deleteInCharge.dto';
import { RegisterInChargeActivityDto } from './dto/request/registerInChargeActivity.dto';
import { UpdateActivityDTO } from './dto/request/updateActivity.dto';
import { GetActivityDto } from './dto/response/getActivity.dto';
import { ActivityServiceInterface } from './interface/activity.interface';
import * as moment from 'moment';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
@Injectable()
export class ActivityService implements ActivityServiceInterface {
  constructor(
    @Inject('ConectionRepositoryInterface')
    private readonly conectionRepository: ConectionRepositoryInterface,
    private readonly eventServiceInterface: EventService, 
    @Inject('UserServiceInterface')
    private readonly userServiceInterface: UserService,
    @Inject('EventRepositoryInterface')
    private readonly eventRepositoryInterface: EventRepositoryInterface,
  ) { }

  async createActivity(activity: ActivityDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, activity.event_id);

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede agregar una actividad a un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if(permissions.role_permissions.CREATE_ACTIVITY !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

    this.validateDateActivity(activity.start_date, activity.end_date, activity.end_date, activity.end_time);

    var crypto = require("crypto");
    activity.activity_id = crypto.randomBytes(12).toString('hex');
    
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    if(!isEmptyOrNullField(activity.in_charge)) activity.in_charge = new ObjectId(activity.in_charge)

    return await this.eventRepositoryInterface.createActivity(activity.event_id, activity, collection);
  }

  async deleteActivity(deleteActivity: DeleteActivityDto, jwt:string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, deleteActivity.event_id);
    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    
    if(permissions.role_permissions.DELETE_ACTIVITY){
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      return await this.eventRepositoryInterface.deleteActivity(deleteActivity.event_id, deleteActivity.activity_id, collection);
    }

    if(permissions.role_permissions.DELETE_OWN_ACTIVITY){
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      const user_id = decodeJWT(jwt).sub;

      return await this.eventRepositoryInterface.deleteOwnActivity(deleteActivity.event_id, deleteActivity.activity_id, user_id, collection);
    }

    throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
  }

  async getActivity(event_id: string, activity_id: string, jwt:string): Promise<GetActivityDto> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');
    const user_id = decodeJWT(jwt).sub;

    return await this.eventRepositoryInterface.getActivity(event_id, activity_id, user_id, collection);
  }

  async registerInChargeActivity(registerInChargeActivity: RegisterInChargeActivityDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, registerInChargeActivity.event_id);
    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if(permissions.role_permissions.REGISTER_IN_CHARGE_ACTIVITY !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.registerInChargeActivity(registerInChargeActivity.event_id, registerInChargeActivity.activity_id, registerInChargeActivity.in_charge, collection);
  }

  async deleteResponsability(deleteResponsability: DeleteInChargeDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, deleteResponsability.event_id);
    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if(permissions.role_permissions.DELETE_IN_CHARGE_ACTIVITY !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

    let db, result;
    db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.deleteResponsability(deleteResponsability.event_id, deleteResponsability.activity_id, collection);
  }

  async getEventActivities(event_id: string, jwt:string): Promise<ActivityDto[]> {    
    const user_id = decodeJWT(jwt).sub;
    
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, event_id);

    return await this.eventRepositoryInterface.getEventActivities(event_id, user_id, permissions, collection);
  }

  async completeActivity(completeActivityBody: CompleteActivityDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, completeActivityBody.event_id);
    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    
    const user_id = decodeJWT(jwt).sub;

    if(permissions.role_permissions.COMPLETE_ACTIVITY){
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      return await this.eventRepositoryInterface.completeActivity(completeActivityBody.event_id, completeActivityBody.activity_id, collection);
    }

    if(permissions.role_permissions.COMPLETE_OWN_ACTIVITY){
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      return await this.eventRepositoryInterface.completeOwnActivity(completeActivityBody.event_id, completeActivityBody.activity_id, user_id, collection);
    }

    throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
  }

  async updateActivity(updateActivity: UpdateActivityDTO, jwt: string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, updateActivity.event_id);
    if(isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);

    if(permissions.role_permissions.UPDATE_ACTIVITY){
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');
      const user_id = decodeJWT(jwt).sub;

      const activity = await this.eventRepositoryInterface.getActivity(updateActivity.event_id, updateActivity.activity_id, user_id, collection);
      updateActivity.in_charge = activity.in_charge ? new ObjectId(activity.in_charge.user_id) : null;

      this.validateDateActivity(updateActivity.start_date, updateActivity.end_date, updateActivity.end_date, updateActivity.end_time);

      return await this.eventRepositoryInterface.updateActivity(updateActivity.event_id, updateActivity, updateActivity.activity_id, collection);
    }

    if(permissions.role_permissions.UPDATE_OWN_ACTIVITY){
      const db = await this.conectionRepository.conectionToDb();
      const collection = db.collection('Events');

      const user_id = decodeJWT(jwt).sub;
      const activity = await this.eventRepositoryInterface.getActivity(updateActivity.event_id, updateActivity.activity_id, user_id, collection);
       
      if (!new ObjectId(activity.in_charge.user_id).equals(new ObjectId(user_id))) 
        throw new BadRequestException(['generic#Debes ser el encargado de la actividad para modificarla.']);

      updateActivity.in_charge = activity.in_charge ? new ObjectId(activity.in_charge.user_id) : null;
      
      this.validateDateActivity(updateActivity.start_date, updateActivity.end_date, updateActivity.end_date, updateActivity.end_time);

      return await this.eventRepositoryInterface.updateOwnActivity(updateActivity.event_id, updateActivity, updateActivity.activity_id, updateActivity.in_charge, collection);
    }

    throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);
  }

  private validateDateActivity(start_date, start_time, end_date, end_time) {
    if (!isEmptyOrNullField(end_date) && !isEmptyOrNullField(start_date)) {
      if (isNotValidDate1GreatherDate2(end_date, start_date))
        throw new BadRequestException(['end_date#La fecha de fin no puede ser menor a la fecha de inicio']);
      if(!isEmptyOrNullField(end_time) && !isEmptyOrNullField(start_time) && (end_date == start_date)){
        end_time = moment(end_time).format("HH:mm");
        start_time = moment(start_time).format("HH:mm");
        if(end_time <= start_time) throw new BadRequestException(['end_time#La hora de fin no puede ser menor o igual a la hora de inicio.'])
      }
    }
  }
}


