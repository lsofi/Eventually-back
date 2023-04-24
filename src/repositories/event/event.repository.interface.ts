import { UpdateEventDTO } from "../../modules/event/dto/request/updateEvent.dto";
import { CreateEventDTO } from "../../modules/event/dto/request/createEvent.dto";
import { EventDto } from "../../modules/event/dto/event.dto";
import { ObjectId } from "mongodb";
import { InvitationDto } from "../../modules/event/dto/invitation.dto";
import { TemplateDto } from "../../modules/event/dto/template.dto";
import { ActivityDto } from "../../modules/activity/dto/activity.dto";
import { UpdateActivityDTO } from "../../modules/activity/dto/request/updateActivity.dto";
import { ConsumableDto } from "../../modules/consumable/dto/consumable.dto";
import { ExpenseDto } from "../../modules/expense/dto/expense.dto";
import { EventExpensesSummaryDto } from "../../modules/expense/dto/eventExpensesSummary.dto";
import { GetExpensesSummaryDto } from "../../modules/expense/dto/response/getExpensesSummary.dto";
import { GetGuestExpensesSummaryDto } from "../../modules/expense/dto/response/getGuestExpensesSummary.dto";
import { PollDto } from "../../modules/poll/dto/poll.dto";
import { TransportDto } from "../../modules/transport/dto/transport.dto";
import { AddressDto } from "../../modules/event/dto/address.dto";
import { QuestionDto } from "src/modules/poll/dto/question.dto";
import { CompleteTransactionDto } from "src/modules/expense/dto/request/completeTransaction.dto";

export interface EventRepositoryInterface {
    getAllEvents(dateToday: string, dateTomorrow: string, timeNow: string, eventCollection);
    getEventById(event_id:string | ObjectId, eventCollection);
    createEvent(event: CreateEventDTO, eventCollection): Promise<boolean>;
    deleteEvent(event_id:string, eventCollection);
    getEventByUserAndEventIdWhenIamCreator(user_id: string, eventCollection);
    getEventByUserAndEventIdWhenImOrganizer(user_id: string, eventCollection);
    getEventByUserAndEventIdWhenImGuest(user_id: string, eventCollection);
    getEventByUserAndEventIdWhenImProvider(user_id: string, eventCollection);
    getEvent(event_id:string, permissions, user_id:string, eventCollection);
    updateEvent(event_id:string, event:UpdateEventDTO, eventCollection): Promise<boolean>;
    updateOrganizerInEvent(event_id: string, eventCollection, user);
    deleteOrganizer(user_id:string, event_id:string, eventCollection): Promise<boolean>;
    deleteOrganizerInConsumables(user_id: string, event_id: string, eventCollection): Promise<boolean>;
    deleteOrganizerInExpenses(user_id: string, event_id: string, eventCollection): Promise<boolean>;
    deleteOrganizerInTransportSubscribers(user_id: string, event_id: string, eventCollection): Promise<boolean>;
    deleteOrganizerInTransportApplication(user_id: string, event_id: string, eventCollection): Promise<boolean>;
    deleteOrganizerInActivityInCharge(user_id: string, event_id: string, eventCollection): Promise<boolean>;
    getEventWithConditions(conditions:{}, eventCollection);
    getPastEventByUserAndEventIdWhenIamCreator(user_id: string, eventCollection);
    getPastEventByUserAndEventIdWhenImOrganizer(user_id: string, eventCollection);
    getPastEventByUserAndEventIdWhenImGuest(user_id: string, eventCollection);
    modifiedEventState(event_id:string | ObjectId, event:EventDto, eventCollection): Promise<boolean>;
    generateInvitationLink(invitation:InvitationDto, invitationCollection);
    findInvitationLInk(invitation_id:string, invitationCollection);
    updateOrganizerPermissions(rolePermissions, event_id: string, eventCollection): Promise<boolean>;
    updateGuestPermissions(rolePermissions, event_id: string, eventCollection): Promise<boolean>;
    updateServicePermissions(rolePermissions, event_id: string, eventCollection): Promise<boolean>;
    updateParticipantsPermissions(event_id:string, guest_id:string|ObjectId, permissions, eventCollection): Promise<boolean>;
    getEventsWhenImOrganizerOrCreator(user_id:string, eventCollection);
    getTemplates(): Promise<TemplateDto[]>;
    createTemplates(template: TemplateDto, templateCollection): Promise<boolean>;
    getEventTypes(eventTypeCollection);
    getEventPaginated(conditions:{}, eventCollection, skip, limit);
    getEmailsParticipants(event_id: string | ObjectId, eventCollection);
    getPhotoStorageInEventById(event_id: string, eventCollection);
    updatePhotoStorageUse(event_id: string, photos_storage_used: number, eventCollection): Promise<boolean>;
    getFileStorageInEventById(event_id: string, eventCollection);
    updateFilesStorageUse(event_id: string, files_storage_used: number, eventCollection): Promise<boolean>;

    /**
     * Métodos para el manejo de módulo de actividades.
     */
    createActivity(event_id: string, activity: ActivityDto, eventCollection): Promise<boolean>;
    deleteActivity(event_id: string, activity_id: string, eventCollection): Promise<boolean>;
    deleteOwnActivity(event_id: string, activity_id: string, in_charge: string, eventCollection): Promise<boolean>;
    getActivity(event_id: string, activity_id: string, user_id: string, eventCollection);
    registerInChargeActivity(event_id: string, activity_id: string, in_charge: string, eventCollection): Promise <boolean>;
    deleteResponsability(event_id: string, activity_id: string, eventCollection): Promise <boolean>;
    getEventActivities(event_id: string, user_id: string, permissions, eventCollection): Promise<ActivityDto[]>;
    completeActivity(event_id: string, activity_id: string, eventCollection): Promise<boolean>;
    completeOwnActivity(event_id: string, activity_id: string, in_charge: string, eventCollection): Promise<boolean>;
    updateActivity(event_id: string, activity: UpdateActivityDTO, activity_id: string, eventCollection): Promise<boolean>;
    updateOwnActivity(event_id: string, activity: UpdateActivityDTO, activity_id: string, in_charge: ObjectId, eventCollection): Promise<boolean>;

    /**
     * Métodos para el manejo de módulo de consumibles
     */
    createConsumable(event_id: string | ObjectId, consumable: ConsumableDto, eventCollection): Promise<boolean>;
    deleteConsumable(event_id: string, consumable_id: string, eventCollection): Promise<boolean>;
    getConsumable(event_id: string, consumable_id: string, eventCollection): Promise<ConsumableDto>;
    subscribeToConsumable(event_id: string, consumable_id: string, subscriber, eventCollection): Promise<boolean>;
    unsubscribeToConsumable(event_id: string, consumable_id: string, user_id: string, eventCollection): Promise<boolean>;
    updateConsumable(event_id: string | ObjectId, consumable_name: string, consumable_description: string, consumable_quantifiable: boolean, consumable_id: string, eventCollection): Promise<boolean>;

    /**
     * Métodos para el manejo de módulo de gastos
     */
    createExpense(event_id: string | ObjectId, expense: ExpenseDto, eventCollection): Promise<boolean>;
    updateExpense(event_id: string | ObjectId, expense: ExpenseDto, expense_id: string, eventCollection): Promise<boolean>;
    getExpense(event_id: string, expense_id: string, user_id: string, eventCollection): Promise<ExpenseDto>;
    updateExpenseSubscribers(event_id: string, expense: ExpenseDto, expense_id: string, eventCollection): Promise<boolean>;
    getExpenses(event_id: string, eventCollection);
    createExpenseSummary(event_id: string, expensesSummary: EventExpensesSummaryDto, eventCollection): Promise<boolean>;
    getExpensesSummary(event_id: string, eventCollection): Promise<GetExpensesSummaryDto>;
    updateExpenseSummary(event_id: string, eventCollection);
    getExpensesSummaryXGuest(event_id: string, user_id: string, eventCollection): Promise<GetGuestExpensesSummaryDto>;
    deleteExpense(event_id: string, expense_id: string, eventCollection): Promise<boolean>;
    completeTransaction(completeTransaction: CompleteTransactionDto, eventCollection): Promise<boolean>;

    /**
     * Métodos para el manejo de módulo de encuestas
     */
    createPoll(event_id: string, poll: PollDto, eventCollection): Promise<boolean>;
    deletePoll(event_id: string, poll_id: string, eventCollection): Promise<boolean>;
    updatePoll(event_id: string, updatePoll: PollDto, poll_id: string, eventCollection): Promise<boolean>;
    getPoll(event_id: string, poll_id: string, eventCollection): Promise<PollDto>;
    getEventPolls(event_id: string, permissions, eventCollection): Promise<any>;
    respondPoll(event_id:string, poll_id:string, questions: QuestionDto[], user_id:string, eventCollection): Promise<boolean>;
    getQuestions(event_id: string, poll_id: string, eventCollection): Promise<PollDto>;
    
    /**
     * Métodos para el manejo de módulo de servicios
     */
    addServiceToEvent(event_id: string, service, eventCollection);
    respondConfirmation(event_id: string, service_id: string, accepted: boolean, eventCollection): Promise<boolean>;
    deleteServiceToEvent(event_id: string, service_id: string, eventCollection): Promise<boolean>;
    getServiceInEvent(event_id:string, service_id: string , eventCollection): Promise<EventDto[]>;
    getInfoProvider(event_id: string, service_id: string, eventCollection);
    qualifyService(event_id: string, service_id: string, rating: number, eventCollection);
    getEventServices(event_id: string, eventCollection);
    /**
     * Métodos para el manejo de módulo de transporte
     */
    createTransport(event_id: string, transport: TransportDto, eventCollection): Promise<boolean>;
    deleteTransport(event_id: string, transport_id: string, eventCollection): Promise<boolean>;
    updateTransport(event_id: string, transport: TransportDto, transport_id: string, eventCollection): Promise<boolean>;
    getTransport(event_id: string, transport_id: string, user_id: string, eventCollection): Promise<TransportDto>;
    subscribeToTransport(event_id: string, transport_id: string, application, eventCollection): Promise<boolean>;
    unsubscribeToTransport(event_id: string, transport_id: string, user_id: string, eventCollection): Promise<boolean>;
    infoMailAnswerApplicationSubscriber(event_id: string, user_id: string, subscriber_user_id: string, eventCollection);
    acceptTransportApplication(event_id: string, transport_id: string, subscriber_user_id: string, subscriber_address: AddressDto, eventCollection): Promise<boolean>;
    rejectTransportApplication(event_id: string, transport_id: string, subscriber_user_id: string, eventCollection): Promise<boolean>;
    getEventTransports(event_id: string, eventCollection): Promise<any>;

    /**
     * Métodos para el manejo de fotos en el evento
     */
    createPhotoAlbum(event_id: string, eventCollection): Promise<boolean>;
    deletePhotoAlbum(event_id: string, eventCollection): Promise<boolean>;

    /**
     * Métodos para el manejo de archivos en el evento
     */
    createFileRepository(event_id: string, eventCollection): Promise<boolean>;
    deleteFileRepository(event_id: string, eventCollection): Promise<boolean>;

    /**
     * Métodos generales
     */
    countDocumentsWithConditions(conditions: {}, collection): Promise<number>;
    getUserInEvent(user_id: string, now:string, eventCollection);
    countEventsByUserWhenIamCreator(user_id: string, eventCollection);
    getEventForPermissions(event_id: string | ObjectId, eventCollection);
    getEventOrganizers(event_id:string, eventCollection);
}