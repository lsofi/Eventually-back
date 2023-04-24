import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { CreateServiceDto } from "../../modules/service/dto/request/createService.dto";
import { ConectionRepositoryInterface } from "../../conection-db/conection.repository,interface";
import { ServiceRepositoryInterface } from "./service.repository.interface";
import { isEmptyOrNullField } from "../../shared/shared-methods.util";
import { UpdateServiceDto } from "../../modules/service/dto/request/updateService.dto";
import { GetServiceDto } from "../../modules/service/dto/response/getService.dto";
import { ServiceDto } from "../../modules/service/dto/service.dto";

@Injectable()
export class ServiceRepository implements ServiceRepositoryInterface {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
    ) { }

    async createService(service: CreateServiceDto, serviceCollection): Promise<boolean> {
        try {
            const service_id = await serviceCollection.insertOne(service).then(result => result.insertedId);

            if (isEmptyOrNullField(service_id)) return false;
            return true;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async findServicesById(service_id: string, serviceCollection) {
        try {
            return await serviceCollection.findOne(
                { _id: new ObjectId(service_id) }
            );
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteService(service_id: string, serviceCollection) {
        try {
            await serviceCollection.deleteOne({ _id: new ObjectId(service_id) });
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteServiceInEvent(service_id: string, eventCollection){
        try{
            await eventCollection.updateMany(
                {},
                { $pull: { 'services': { service_id: new ObjectId(service_id) } } }
            )
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async publishService(service_id: string, publish: boolean, serviceCollection): Promise<boolean> {
        try {
            const result = await serviceCollection.updateOne(
                { _id: new ObjectId(service_id) },
                { $set: { visible: publish } },
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getServicesPaginated(conditions: {}, serviceCollection, pageNumber: number, nPerPage: number) {
        try {
            const services = await serviceCollection.find(conditions).skip(pageNumber > 0 ? ((pageNumber - 1) * nPerPage) : 0).limit(nPerPage).toArray()
            return services;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateService(service_id: string, user_id: string, updateService: UpdateServiceDto, serviceCollection): Promise<boolean> {
        try {
            const result = await serviceCollection.updateOne(
                { _id: new ObjectId(service_id), provider: new ObjectId(user_id) },
                { $set: updateService },
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateService2(service_id: string, updateService: ServiceDto, serviceCollection): Promise<boolean> {
        try {
            const result = await serviceCollection.updateOne(
                { _id: new ObjectId(service_id)},
                { $set: updateService },
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getMyServices(user_id: string, serviceCollection): Promise<GetServiceDto[]> {
        try {
            const servicios = await serviceCollection
                .find({ provider: new ObjectId(user_id) })
                .toArray();

            if (servicios?.length == 0) return [];

            return servicios;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async countServicesByUser(user_id: string, serviceCollection) {
        try {
            const services = await serviceCollection
                .find({ provider: new ObjectId(user_id) })
                .count();
            return services;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
    async getServiceTypes(serviceTypeCollection) {
        try {
            return await serviceTypeCollection.find().toArray();;
        } catch (err) {
            throw new BadRequestException(err)
        }
    }
}