import { AddressDto } from "../address.dto";
import { UserInEventDTO } from "./usersInEvent.dto";

export class GetEventInfoDto{
  title: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  description: string;
  address: AddressDto;
  creator: UserInEventDTO;
}