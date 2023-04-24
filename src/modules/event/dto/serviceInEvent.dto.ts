export class ServiceEventDto {
    public service_id: string;
    public name: string;
    public type: string;
    public accepted: string;
    public description: string;
    public date_service: string;
    public time_service: string;
    public provider: string;
    public permissions?: string;
}