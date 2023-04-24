import { ObjectId } from 'mongodb';
import { ConsumableDto } from '../../../consumable/dto/consumable.dto';
import { ExpenseDto } from '../../../expense/dto/expense.dto';
import { ActivityDto } from '../../../activity/dto/activity.dto';
import { GuestDto } from '../../../guest/dto/guest.dto';
import { AddressDto } from '../address.dto';
import { TypeEventDto } from '../typeEvent.dto';
import { UserInEventDTO } from './usersInEvent.dto';
import { ServiceDto } from '../../../../modules/service/dto/service.dto';

export class GetMyEventDTO {
  _id: ObjectId;
  title: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  description: string;
  address: AddressDto;
  creator: UserInEventDTO;
  organizers: UserInEventDTO[];
  activities: ActivityDto[];
  consumables: ConsumableDto[];
  expenses: ExpenseDto[];
  type: TypeEventDto;
  photo: string;
  guests: GuestDto[];
  role_permissions;
  state: string;
  CREATOR?: any;
  ORGANIZER?:any;
  GUEST?:any;
  SERVICE?: string;
  services: ServiceDto[];
}
