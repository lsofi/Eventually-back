import { QualifyServiceDto } from "../../modules/service/dto/request/qualifyService.dto";
import { CreateServiceDto } from "../../modules/service/dto/request/createService.dto";
import { UpdateServiceDto } from "../../modules/service/dto/request/updateService.dto";
import { GetServiceDto } from "../../modules/service/dto/response/getService.dto";
import { ServiceDto } from "../../modules/service/dto/service.dto";

export interface ServiceRepositoryInterface {
    createService(service: CreateServiceDto, serviceCollection): Promise<boolean>;
    findServicesById(service_id: string, serviceCollection);
    deleteService(service_id: string, serviceCollection);
    publishService(service_id: string, publish: boolean, serviceCollection): Promise<boolean>;
    getServicesPaginated(conditions: {}, serviceCollection, skip: number, limit:number);
    updateService(service_id: string, user_id: string, updateService: UpdateServiceDto, serviceCollection): Promise<boolean>;
    updateService2(service_id: string, updateService: ServiceDto, serviceCollection): Promise<boolean>;
    getMyServices(user_id: string, serviceCollection): Promise<GetServiceDto[]>;
    countServicesByUser(user_id: string, serviceCollection);
    getServiceTypes(serviceCollection);
    deleteServiceInEvent(service_id: string, eventCollection);
}