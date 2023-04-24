import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { decodeJWT, isEmptyOrNullField } from '../../shared/shared-methods.util';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { UserService } from '../user/user.service';
import { DeleteServiceDto } from './dto/request/deleteService.dto';
import { GetServiceDto, UserInCharge } from './dto/response/getService.dto';
import { ServiceDto } from './dto/service.dto';
import { ServiceServiceInterface } from './interface/service.interface';
import * as bcrypt from 'bcrypt';
import { PublishServiceDto } from './dto/request/publishService.dto';
import { AddServiceDto } from './dto/request/sentConfirmationServiceEmail.dto';
import { EventService } from '../event/event.service';
import { sentServiceConfirmationEmail } from '../../shared/email/serviceConfirmationEmail';
import * as moment from 'moment';
import { DeleteServiceToEventDto } from './dto/request/deleteServiceToEvent.dto';
import { CreateServiceDto } from './dto/request/createService.dto';
import { UpdateServiceDto } from './dto/request/updateService.dto';
import { ServiceRepositoryInterface } from '../../repositories/service/service.repository.interface';
import { UserRepositoryInterface } from '../../repositories/user/user.repository.interface';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import { EventDto } from '../event/dto/event.dto';
import { avisoEliminacionServicio } from '../../shared/email/avisoEliminiacionServicio';
import { QualifyServiceDto } from './dto/request/qualifyService.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationDto } from '../gateway/dto/notifications.dto';
import { MessageRepositoryInterface } from '../../repositories/message/message.repository.interface';
const crypto = require("crypto");

@Injectable()
export class ServiceService implements ServiceServiceInterface {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
        @Inject('UserServiceInterface')
        private readonly userServiceInterface: UserService,
        private readonly eventService: EventService,
        @Inject('ServiceRepositoryInterface')
        private readonly serviceRepository: ServiceRepositoryInterface,
        @Inject('UserRepositoryInterface')
        private readonly userRepository: UserRepositoryInterface,
        @Inject('EventRepositoryInterface')
        private readonly eventRepositoryInterface: EventRepositoryInterface,
        private readonly notificationGateway: NotificationsGateway,
        @Inject('MessageRepositoryInterface')
        private readonly messageRepositoryInterface: MessageRepositoryInterface
    ) { }

    async createService(service: CreateServiceDto, jwt: string): Promise<boolean> {
        if (!isEmptyOrNullField(service.address.number)) service.address.number = Number(service.address.number);
        if (!isEmptyOrNullField(service.range)) service.range = Number(service.range);
        if (!isEmptyOrNullField(service.price)) service.price = Number(service.price)

        const user_id = decodeJWT(jwt).sub;

        service.visible = true;
        service.provider = new ObjectId(user_id);

        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Services');
        const userCollection = db.collection('Users');

        const promises = [];

        let cantidadServicios = await this.serviceRepository.countServicesByUser(user_id, collection);
        promises.push(cantidadServicios);

        let user = await this.userRepository.findUserById(user_id, userCollection);
        promises.push(user);

        const processedPromise = await Promise.allSettled(promises);

        if(processedPromise[0].status === 'fulfilled' && processedPromise[0].value) cantidadServicios = processedPromise[0].value;
        if(processedPromise[1].status === 'fulfilled' && processedPromise[1].value) user = processedPromise[1].value;

        if (cantidadServicios >= 1 && user.subscriptionType === 'basic') throw new BadRequestException(['premium#Debes ser usuario premium para brindar más de un servicio a la vez.']);
        
        if (isEmptyOrNullField(service.providerString)) {
            service.providerString = user.name + ' ' + user.lastname;
        }

        return await this.serviceRepository.createService(service, collection);
    }

    async getService(service_id: string): Promise<GetServiceDto> {
        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Services');

        const service: ServiceDto = await this.serviceRepository.findServicesById(service_id, collection);

        if (isEmptyOrNullField(service)) throw new BadRequestException(['generic#El servicio ingresado no existe.']);

        const userInCharge = await this.userServiceInterface.getUser(service.provider.toHexString());

        const userInService = {
            user_id: service.provider.toHexString(),
            lastname: userInCharge.lastname,
            name: userInCharge.name,
            username: userInCharge.username
        } as UserInCharge;

        const servicio = {
            service_id: service._id.toHexString(),
            name: service.name,
            description: service.description,
            photo: service.photo,
            availability: service.availability,
            address: service.address,
            range: service.range,
            type: service.type,
            visible: service.visible,
            providerString: service.providerString,
            provider: userInService,
            contact_number: service.contact_number,
            contact_email: service.contact_email ? service.contact_email : '',
            price: service.price ? service.price : ''
        } as GetServiceDto;

        return servicio;
    }

    async deleteService(deleteService: DeleteServiceDto, jwt: string): Promise<boolean> {
        const db = await this.conectionRepository.conectionToDb();
        const collectionServices = db.collection('Services');
        const collectionUsers = db.collection('Users');
        const messageCollection = db.collection('Messages');
        const eventCollection = db.collection('Events');

        const user_id = decodeJWT(jwt).sub;

        const promises = [];

        let user = await this.userRepository.findUserById(user_id, collectionUsers);
        promises.push(user);

        let service = await this.serviceRepository.findServicesById(deleteService.service_id, collectionServices);
        promises.push(service);

        const processedPromise = await Promise.allSettled(promises);

        if(processedPromise[0].status === 'fulfilled' && processedPromise[0].value) user = processedPromise[0].value;
        if(processedPromise[1].status === 'fulfilled' && processedPromise[1].value) service = processedPromise[1].value;

        if (!service.provider.equals(new ObjectId(user_id))) throw new BadRequestException(['generic#Debes ser el creador del servicio para poder eliminarlo.']);

        if ((await bcrypt.compare(deleteService.password, user.password)) === false)
            throw new BadRequestException(['password#La contraseña ingresada es incorrecta.']);

        let promise = [];
        let deleteServiceInChat =  this.messageRepositoryInterface.deleteChatService(deleteService.service_id, messageCollection);
        promise.push(deleteServiceInChat);
        let deleteServiceInEvent = this.serviceRepository.deleteServiceInEvent(deleteService.service_id, eventCollection);
        promise.push(deleteServiceInEvent);
        let deleteServiceInBd = this.serviceRepository.deleteService(deleteService.service_id, collectionServices);
        promise.push(deleteServiceInBd);

        await Promise.allSettled(promise);
        return true;
    }

    async publishService(publishService: PublishServiceDto, jwt: string): Promise<boolean> {
        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Services');

        return await this.serviceRepository.publishService(publishService.service_id, publishService.publish, collection);
    }

    async getServicesWithFilters(ciudad: string, provincia: string,type: string, priceMin: string, priceMax: string, rating: string, skip, limit, quiet: string, name:string): Promise<any> {
        const quietBoolean = quiet === 'true' ? true : false;
        
        let conditions = {};
        let and_clauses = [];

        and_clauses.push({ visible: true })

        if(!isEmptyOrNullField(ciudad)) and_clauses.push({'address.city': ciudad});

        if(!isEmptyOrNullField(provincia)) and_clauses.push({'address.province': provincia});

        if (!isEmptyOrNullField(type)) and_clauses.push({ type: type })

        if (!isEmptyOrNullField(priceMin)) and_clauses.push({ price: { $gte: Number(priceMin) } })

        if (!isEmptyOrNullField(priceMax)) and_clauses.push({ price: { $lte: Number(priceMax) } })

        if (!isEmptyOrNullField(rating)) and_clauses.push({ rating: { $gte: Number(rating) } })

        if(!isEmptyOrNullField(name)) and_clauses.push({name: new RegExp(name, "i")})

        if (and_clauses?.length > 0) conditions['$and'] = and_clauses;

        const db = await this.conectionRepository.conectionToDb();
        const serviceCollection = db.collection('Services');
        
        const countServicesWithConditions = await this.eventRepositoryInterface.countDocumentsWithConditions(conditions, serviceCollection);

        const services = await this.serviceRepository.getServicesPaginated(conditions, serviceCollection, Number(skip), Number(limit));
        if (services?.length === 0 && !quietBoolean) throw new BadRequestException(['warning#No se encontraron servicios con esa combinación de filtros.'])

        return {count: countServicesWithConditions, services};
    }

    async updateService(updateService: UpdateServiceDto, jwt: string): Promise<boolean> {
        if (!isEmptyOrNullField(updateService.address.number)) updateService.address.number = Number(updateService.address.number);
        if (!isEmptyOrNullField(updateService.range)) updateService.range = Number(updateService.range);
        if (!isEmptyOrNullField(updateService.price)) updateService.price = Number(updateService.price)

        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Services');
        const user_id = decodeJWT(jwt).sub;

        updateService.provider = new ObjectId(updateService.provider);

        if (isEmptyOrNullField(updateService.providerString)) {
            const userCollection = db.collection('Users');
            const user = await this.userRepository.findUserById(user_id, userCollection);
            updateService.providerString = user.name + ' ' + user.lastname;
        }

        return await this.serviceRepository.updateService(updateService.service_id, user_id, updateService, collection);
    }

    async getMyServices(jwt: string): Promise<GetServiceDto[]> {
        const user_id = decodeJWT(jwt).sub;

        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Services');

        return await this.serviceRepository.getMyServices(user_id, collection);
    }

    async addServiceToEvent(jwt: string, addServiceDto: AddServiceDto) {
        const permissions = await this.eventService.getAllPermissionsInEvent(jwt, addServiceDto.event_id);
        if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningún permiso permitido para realizar esta acción.']);
        if (permissions.role_permissions.ADD_SERVICE_TO_EVENT !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);

        const db = await this.conectionRepository.conectionToDb();
        const serviceCollection = db.collection('Services');
        const eventCollection = db.collection('Events');
        const userCollection = db.collection('Users');

        const existsService = await this.serviceRepository.findServicesById(addServiceDto.service_id, serviceCollection);

        if (isEmptyOrNullField(existsService)) throw new BadRequestException(['generic#No se encontró el servicio ingresado.']);

        const event = await this.eventService.getEvent(addServiceDto.event_id, jwt);

        const serviceInEvent = event.services?.find(x => x.service_id == addServiceDto.service_id);
        if (!isEmptyOrNullField(serviceInEvent)) throw new BadRequestException(['generic#El servicio ya fue agregado al evento.']);

        const service = {
            service_id: new ObjectId(addServiceDto.service_id),
            accepted: null,
            date_service: addServiceDto.date_service,
            time_service: addServiceDto.time_service,
            provider: existsService.provider
        };

        await this.eventRepositoryInterface.addServiceToEvent(addServiceDto.event_id, service, eventCollection);
        await sentServiceConfirmationEmail(existsService.providerString, event.title, event.start_date, event.start_time, existsService.contact_email, addServiceDto.date_service, addServiceDto.time_service, addServiceDto.event_id, addServiceDto.service_id, existsService.name);

        const url =  `/events/serviceConfirmation?event_id=${addServiceDto.event_id}&service_id=${addServiceDto.service_id}&date_service=${addServiceDto.date_service}&time_service=${addServiceDto.time_service}`;
        const message = {
            title: 'Han agregado tu servicio a un evento.',
            notification_id: crypto.randomBytes(12).toString('hex'),
            message: `Han agregado tu servicio '${existsService.name}' al evento '${event.title}'. Por favor, revisa tu casilla de correo para contestar la oferta.`,
            seen: false,
            href: url
        } as NotificationDto;
  
        await this.userRepository.addNotificationToUser(existsService.provider, message, userCollection);

        const participantsId = [existsService.provider]

        this.notificationGateway.handleEmailSent(message, participantsId);

        return true;
    }

    private async getServiceInEvent(event_id: string, service_id: string, eventCollection): Promise<EventDto[]>{
        return await this.eventRepositoryInterface.getServiceInEvent(event_id, service_id, eventCollection);
    }

    validateDate(date_service, time_service) {
        const isValidDate = moment(date_service, 'YYYY-MM-DD').isValid();
        if (!isValidDate) throw new BadRequestException(['date_service#La fecha ingresada no posee el formato correcto.']);

        const isValidTime = moment(time_service, 'HH:mm').isValid();
        if (!isValidTime) throw new BadRequestException(['time_service#La hora ingresada no posee el formato correcto.'])
    };

    async respondConfirmation(respondConfirmationBody: AddServiceDto): Promise<boolean> {
        const db = await this.conectionRepository.conectionToDb();
        const serviceCollection = db.collection('Services');
        const eventCollection = db.collection('Events');

        const event = await this.eventRepositoryInterface.getEventById(respondConfirmationBody.event_id, eventCollection);
        if (isEmptyOrNullField(event)) throw new BadRequestException(['generic#No se encontró el evento.']);

        const existsService = await this.serviceRepository.findServicesById(respondConfirmationBody.service_id, serviceCollection);
        if (isEmptyOrNullField(existsService)) throw new BadRequestException(['generic#No se encontró el servicio ingresado.']);

        return await this.eventRepositoryInterface.respondConfirmation(respondConfirmationBody.event_id, respondConfirmationBody.service_id, respondConfirmationBody.accepted, eventCollection);
    }

    async deleteServiceToEvent(deleteServiceToEvent: DeleteServiceToEventDto, jwt: string): Promise<boolean> {
        const permissions = await this.eventService.getAllPermissionsInEvent(jwt, deleteServiceToEvent.event_id);
        if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
        if (permissions.role_permissions.DELETE_SERVICE_TO_EVENT !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.'])

        if (permissions.state == 'canceled' || permissions.state == 'finalized')
            throw new BadRequestException(['generic#No se puede eliminar un servicio de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Events');
        const userCollection =  db.collection('Users');

        const service = await this.eventRepositoryInterface.getInfoProvider(deleteServiceToEvent.event_id, deleteServiceToEvent.service_id, collection);
        
        const serviceUsername = service[0].services_full[0].username;
        const serviceEmail = service[0].services_full[0].email;
        const eventTitle = service[0].title;
        const serviceName = service[0].service_info[0].name;

        await avisoEliminacionServicio(serviceUsername, serviceEmail, eventTitle, serviceName);

        const message = {
            title: 'Han eliminado tu servicio de un evento.',
            notification_id: crypto.randomBytes(12).toString('hex'),
            message: `¡Han eliminado tu servicio '${serviceName}' del evento: '${eventTitle}' 🙁!`,
            seen: false,
        } as NotificationDto;

        await this.userRepository.addNotificationToUser(service[0].services_full[0].provider, message, userCollection);

        const participantsId = [service[0].services_full[0].provider]

        this.notificationGateway.handleEmailSent(message, participantsId);

        return await this.eventRepositoryInterface.deleteServiceToEvent(deleteServiceToEvent.event_id, deleteServiceToEvent.service_id, collection);
    }

    async qualifyService(qualifyServiceDto: QualifyServiceDto, jwt: string): Promise<boolean> {
        const db = await this.conectionRepository.conectionToDb();
        const servicesCollection = db.collection('Services');
        const eventsCollection = db.collection('Events');

        const user_id = decodeJWT(jwt).sub;

        const service: ServiceDto = await this.serviceRepository.findServicesById(qualifyServiceDto.service_id, servicesCollection);

        if (service.provider.equals(new ObjectId(user_id)))
            throw new BadRequestException(['generic#No puedes calificar un servicio propio.']);

        if (isEmptyOrNullField(service.acumRatings) || isEmptyOrNullField(service.numberOfRatings) ) {
            service.acumRatings = 0;
            service.numberOfRatings = 0;
        }

        service.acumRatings += qualifyServiceDto.rate;
        service.numberOfRatings += 1;
        service.rating = service.acumRatings/service.numberOfRatings;

        await this.serviceRepository.updateService2(qualifyServiceDto.service_id, service, servicesCollection);
        await this.eventRepositoryInterface.qualifyService(qualifyServiceDto.event_id, qualifyServiceDto.service_id, qualifyServiceDto.rate, eventsCollection);

        return true;
    }

    async getEventServices(event_id: string, jwt:string){
        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('Events');
        
        return await this.eventRepositoryInterface.getEventServices(event_id, collection);
    }

    async getServiceTypes(){
        const db = await this.conectionRepository.conectionToDb();
        const collection = db.collection('ServiceTypes');
    
        const types = await this.serviceRepository.getServiceTypes(collection);
    
        types.sort((a, b) => this.sortByMaube(a,b));
    
        return types;
    }
    
    private sortByMaube(a , b){
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
    }
}
