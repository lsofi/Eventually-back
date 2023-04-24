import { ObjectId } from "mongodb";
import { Role } from "../../../../auth/roles/role.enum";

export class HistorialEventosCreadosDto {
  event_id: ObjectId;
  title: string;
  start_date: string;
  start_time: string;
  address_alias: string;
  photo: string;
  type: InfoEventType;
  state: string;
}

export class InfoEventType {
  name: string;
  is_private: boolean;
}

export class eventsByRole{
  role: Role;
  event: HistorialEventosCreadosDto;
}