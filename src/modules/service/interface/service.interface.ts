import { CreateServiceDto } from "../dto/request/createService.dto";
import { DeleteServiceDto } from "../dto/request/deleteService.dto";
import { DeleteServiceToEventDto } from "../dto/request/deleteServiceToEvent.dto";
import { PublishServiceDto } from "../dto/request/publishService.dto";
import { QualifyServiceDto } from "../dto/request/qualifyService.dto";
import { AddServiceDto } from "../dto/request/sentConfirmationServiceEmail.dto";
import { UpdateServiceDto } from "../dto/request/updateService.dto";
import { GetServiceDto } from "../dto/response/getService.dto";

export interface ServiceServiceInterface {
    createService(service: CreateServiceDto, jwt: string): Promise<boolean>;
    deleteService(deleteService: DeleteServiceDto, jwt: string): Promise<boolean>;
    getService(service_id: string): Promise<GetServiceDto>;
    publishService(publishService: PublishServiceDto, jwt: string): Promise<boolean>;
    getServicesWithFilters(ciudad: string, provincia: string, type: string, priceMin: string, priceMax: string, rating: string, skip, limit, quiet: string, name: string): Promise<GetServiceDto[]>;
    updateService(updateService: UpdateServiceDto, jwt: string) : Promise<boolean>;
    getMyServices(jwt: string): Promise<GetServiceDto[]>;
    addServiceToEvent(jwt:string, addServiceDto: AddServiceDto);
    respondConfirmation(addServiceDto: AddServiceDto): Promise<boolean>;
    deleteServiceToEvent(deleteServiceToEvent: DeleteServiceToEventDto, jwt: string): Promise<boolean>;
    qualifyService(qualifyServiceDto: QualifyServiceDto, jwt: string): Promise<boolean>;
    getServiceTypes();
    getEventServices(event_id: string, jwt:string);
  }