import { InfoEventType } from "./historialEventoDto";

export class PastHistorialEventsDTO{
    event_id: string;
    title: string;
    start_date: string;
    start_time: string;
    address_alias: string | null;
    photo: string | null;
    type: InfoEventType;
    state: string;
}