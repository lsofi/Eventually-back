import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateEventDTO } from "../../modules/event/dto/request/createEvent.dto";
import { ConectionRepositoryInterface } from "../../conection-db/conection.repository,interface";
import { EventRepositoryInterface } from "./event.repository.interface";
import { isEmptyOrNullField } from "../../shared/shared-methods.util";
import { ObjectId } from "mongodb";
import { UpdateEventDTO } from "../../modules/event/dto/request/updateEvent.dto";
import { EventDto } from "../../modules/event/dto/event.dto";
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

@Injectable()
export class EventRepository implements EventRepositoryInterface {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
    ) { }

    async getEventById(event_id: string | ObjectId, eventCollection) {
        try {
            return await eventCollection
                .findOne({ _id: new ObjectId(event_id) });
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
    
    async createEvent(event: CreateEventDTO, eventCollection): Promise<boolean> {
        try {
            const event_id = await eventCollection.insertOne(event).then(result => result.insertedId);

            if (isEmptyOrNullField(event_id)) return false;
            return true;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteEvent(event_id: string, eventCollection) {
        try {
            await eventCollection.deleteOne({ _id: new ObjectId(event_id) });
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getEventByUserAndEventIdWhenIamCreator(user_id: string, eventCollection) {
        try {
            const events = await eventCollection
                .find({
                    creator: new ObjectId(user_id),
                    $nor: [{ state: 'canceled' }, { state: 'finalized' }]
                })
                .toArray();
            return events;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getEventByUserAndEventIdWhenImOrganizer(user_id: string, eventCollection) {
        try {
            const events = await eventCollection
                .find({
                    "organizers.user_id": new ObjectId(user_id),
                    $nor: [{ state: 'canceled' }, { state: 'finalized' }]
                })
                .toArray();
            return events;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getEventByUserAndEventIdWhenImGuest(user_id: string, eventCollection) {
        try {
            const event = await eventCollection
                .find({
                    $and: [{ "guests.user_id": new ObjectId(user_id)}, {"guests.accepted": true }],
                    $nor: [{ state: 'canceled' }, { state: 'finalized' }]
                })
                .toArray();
            return event;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getEventByUserAndEventIdWhenImProvider(user_id: string, eventCollection) {
        try {
            const events = await eventCollection
                .find({
                    "services.provider": new ObjectId(user_id),
                    $nor: [{ state: 'canceled' }, { state: 'finalized' }]
                })
                .toArray();
            return events;
        } catch (err) {
            throw new BadRequestException(err)
        }
    }

    async getEvent(event_id: string, permissions, user_id: string, eventCollection) {
        try {
            const event = await eventCollection.aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectId(event_id)
                        }
                    }, {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'guests.user_id',
                            'foreignField': '_id',
                            'as': 'guests-full'
                        }
                    }, {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'organizers.user_id',
                            'foreignField': '_id',
                            'as': 'organizers-full'
                        }
                    }, {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'creator',
                            'foreignField': '_id',
                            'as': 'creator-full'
                        }
                    }, {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'activities.in_charge',
                            'foreignField': '_id',
                            'as': 'activities-full'
                        }
                    }, {
                        '$lookup': {
                            'from': 'Services',
                            'localField': 'services.service_id',
                            'foreignField': '_id',
                            'as': 'services-full'
                        }
                    }, {
                        '$project': {
                            'guests': {
                                '$map': {
                                    'input': '$guests',
                                    'as': 'guest',
                                    'in': {
                                        '$mergeObjects': [
                                            '$$guest', {
                                                '$arrayElemAt': [
                                                    '$guests-full', {
                                                        '$indexOfArray': [
                                                            '$guests-full._id', '$$guest.user_id'
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            'organizers': {
                                '$map': {
                                    'input': '$organizers',
                                    'as': 'organizer',
                                    'in': {
                                        '$mergeObjects': [
                                            '$$organizer', {
                                                '$arrayElemAt': [
                                                    '$organizers-full', {
                                                        '$indexOfArray': [
                                                            '$organizers-full._id', '$$organizer.user_id'
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            'creator': {
                                '$arrayElemAt': [
                                    '$creator-full', 0
                                ]
                            },
                            'activities': {
                                '$map': {
                                    'input': {
                                        '$filter': {
                                            'input': '$activities',
                                            'as': 'activity',
                                            'cond': permissions.role_permissions.VIEW_ALL_TASKS === true ?
                                                { $eq: [1, 1] } : permissions.role_permissions.VIEW_OWN_TASK === true ?
                                                    { $eq: ['$$activity.in_charge', new ObjectId(user_id)] } :
                                                    { $eq: [1, 2] }
                                        }
                                    },
                                    'as': 'activity',
                                    'in': {
                                        'in_charge': {
                                            '$arrayElemAt': [
                                                '$activities-full', {
                                                    '$indexOfArray': [
                                                        '$activities-full._id', '$$activity.in_charge'
                                                    ]
                                                }
                                            ]
                                        },
                                        'activity_id': '$$activity.activity_id',
                                        'name': '$$activity.name',
                                        'complete': '$$activity.complete',
                                        'checklist': '$$activity.checklist',
                                        'start_date': '$$activity.start_date',
                                        'start_time': '$$activity.start_time',
                                        'end_date': '$$activity.end_date',
                                        'end_time': '$$activity.end_time'
                                    }
                                }
                            },
                            'services': {
                                '$map': {
                                    'input': '$services',
                                    'as': 'service',
                                    'in': {
                                        '$mergeObjects': [
                                            '$$service', {
                                                '$arrayElemAt': [
                                                    '$services-full', {
                                                        '$indexOfArray': [
                                                            '$services-full._id', '$$service.service_id'
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            'expenses': {
                                '$filter': {
                                    'input': '$expenses',
                                    'as': 'expense',
                                    'cond': permissions.role_permissions.VIEW_ALL_EXPENSES === true ?
                                        { $eq: [1, 1] } : permissions.role_permissions.VIEW_OWN_EXPENSES === true ?
                                            { $eq: ['$$expense.in_charge', new ObjectId(user_id)] } :
                                            { $eq: [1, 2] }
                                }
                            },
                            'polls': {
                                '$filter': {
                                    'input': '$polls',
                                    'as': 'poll',
                                    'cond': permissions.role_permissions.UPDATE_POLL === true ? 
                                            { $eq: [1, 1] } : 
                                            { $and: [
                                                 { $eq: ['$$poll.visible', true] },
                                                 { $eq: ['$state', 'postEvent'] }
                                                ]}
                                }
                            },
                            'title': '$title',
                            'start_date': '$start_date',
                            'start_time': '$start_time',
                            'end_date': '$end_date',
                            'end_time': '$end_time',
                            'description': '$description',
                            'address': '$address',
                            'consumables': '$consumables',
                            'transports': "$transports",
                            'type': '$type',
                            'photo': '$event_photo',
                            'state': '$state',
                            'files_repository': '$files_repository',
                            'photo_album': '$photo_album',
                            'CREATOR': '$CREATOR_PERMI',
                            'ORGANIZER': '$ORGANIZER_PERMI',
                            'GUEST': '$GUEST_PERMI',
                            'SERVICE': '$SERVICE_PERMI',
                            'PUBLIC_GUEST': '$PUBLIC_GUEST_PERMI'
                        }
                    }, {
                        '$project': {
                            'guests': {
                                '$map': {
                                    'input': '$guests',
                                    'as': 'guest',
                                    'in': {
                                        'user_id': '$$guest.user_id',
                                        'username': '$$guest.username',
                                        'name': '$$guest.name',
                                        'lastname': '$$guest.lastname',
                                        'accepted': '$$guest.accepted',
                                        'profile_photo': '$$guest.small_photo',
                                        'subscriptionType': '$$guest.subscriptionType'
                                    }
                                }
                            },
                            'organizers': {
                                '$map': {
                                    'input': '$organizers',
                                    'as': 'organizer',
                                    'in': {
                                        'user_id': '$$organizer.user_id',
                                        'username': '$$organizer.username',
                                        'name': '$$organizer.name',
                                        'lastname': '$$organizer.lastname',
                                        'profile_photo': '$$organizer.small_photo',
                                        'subscriptionType': '$$organizer.subscriptionType'
                                    }
                                }
                            },
                            'creator': {
                                'user_id': '$creator._id',
                                'username': '$creator.username',
                                'name': '$creator.name',
                                'lastname': '$creator.lastname',
                                'profile_photo': '$creator.small_photo',
                                'subscriptionType': '$creator.subscriptionType'
                            },
                            'activities': {
                                '$map': {
                                    'input': '$activities',
                                    'as': 'activity',
                                    'in': {
                                        'in_charge': {
                                            'user_id': '$$activity.in_charge._id',
                                            'username': '$$activity.in_charge.username',
                                            'name': '$$activity.in_charge.name',
                                            'lastname': '$$activity.in_charge.lastname',
                                            'profile_photo': '$$activity.in_charge.small_photo',
                                            'subscriptionType': '$$activity.in_charge.subscriptionType'
                                        },
                                        'activity_id': '$$activity.activity_id',
                                        'name': '$$activity.name',
                                        'complete': '$$activity.complete',
                                        'checklist': '$$activity.checklist',
                                        'start_date': '$$activity.start_date',
                                        'start_time': '$$activity.start_time',
                                        'end_date': '$$activity.end_date',
                                        'end_time': '$$activity.end_time',
                                        'isOwn': {
                                            '$eq': [
                                                '$$activity.in_charge._id', new ObjectId(user_id)
                                            ]
                                        }
                                    }
                                }
                            },
                            'services': {
                                '$map': {
                                    'input': '$services',
                                    'as': 'service',
                                    'in': {
                                        'service_id': '$$service.service_id',
                                        'name': '$$service.name',
                                        'type': '$$service.type',
                                        'accepted': '$$service.accepted',
                                        'rating': '$$service.rating',
                                        'rating_event': '$$service.rating_event',
                                        'description': '$$service.description',
                                        'date_service': '$$service.date_service',
                                        'time_service': '$$service.time_service'
                                    }
                                }
                            },
                            'expenses': {
                                '$map': {
                                    'input': '$expenses',
                                    'as': 'expense',
                                    'in': {
                                        'expense_id': '$$expense.expense_id',
                                        'name': '$$expense.name',
                                        'description': '$$expense.description',
                                        'quantifiable': '$$expense.quantifiable',
                                        'amount': '$$expense.amount',
                                        'in_charge': '$$expense.in_charge',
                                        'total_quantity': '$$expense.total_quantity',
                                        'isOwn': {
                                            '$eq': [
                                                '$$expense.in_charge', new ObjectId(user_id)
                                            ]
                                        },
                                        'subscribers': '$$expense.subscribers'
                                    }
                                }
                            },
                            'polls': {
                                '$map': {
                                    'input': '$polls',
                                    'as': 'poll',
                                    'in': {
                                        'poll_id': '$$poll.poll_id',
                                        'name': '$$poll.name',
                                        'visible': '$$poll.visible',
                                        'questions': '$$poll.questions',
                                        'has_answers': '$$poll.has_answers'
                                    }
                                }
                            },
                            'title': '$title',
                            'start_date': '$start_date',
                            'start_time': '$start_time',
                            'end_date': '$end_date',
                            'end_time': '$end_time',
                            'description': '$description',
                            'address': '$address',
                            'consumables': '$consumables',
                            'transports': "$transports",
                            'type': '$type',
                            'photo': '$photo',
                            'state': '$state',
                            'files_repository': '$files_repository',
                            'photo_album': '$photo_album',
                            'CREATOR': '$CREATOR',
                            'ORGANIZER': '$ORGANIZER',
                            'GUEST': '$GUEST',
                            'SERVICE': '$SERVICE',
                            'PUBLIC_GUEST': '$PUBLIC_GUEST'
                        }
                    }
                ]
            ).toArray();

            return event;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateEvent(event_id: string, event: UpdateEventDTO, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: event }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateOrganizerInEvent(event_id: string, eventCollection, user) {
        try {
            await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $push: { organizers: { user_id: new ObjectId(user._id) } } }
            );
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteOrganizer(user_id: string, event_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $pull: { 'organizers': { user_id: new ObjectId(user_id) } } }
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteOrganizerInConsumables(user_id: string, event_id: string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id)},
                { $pull: {"consumables.$[element].subscribers": { user_id: new ObjectId(user_id) }}},
                { arrayFilters: [{ "element.subscribers": { $elemMatch: { "user_id" : new ObjectId(user_id)} } } ] }
            )

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteOrganizerInExpenses(user_id: string, event_id: string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id)},
                {$pull: {"expenses.$[element].subscribers": { user_id: new ObjectId(user_id) }}},
                { arrayFilters: [{ "element.subscribers": { $elemMatch: { "user_id" : new ObjectId(user_id)} } } ] }
            )

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteOrganizerInTransportSubscribers(user_id: string, event_id: string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id)},
                {$pull: {"transports.$[element].subscribers": { user_id: new ObjectId(user_id) }}},
                { arrayFilters: [{ "element.subscribers": { $elemMatch: { "user_id" : new ObjectId(user_id)} } } ] }
            )

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteOrganizerInTransportApplication(user_id: string, event_id: string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id)},
                {$pull: {"transports.$[element].applications": { user_id: new ObjectId(user_id) }}},
                { arrayFilters: [{ "element.subscribers": { $elemMatch: { "user_id" : new ObjectId(user_id)} } } ] }
            )

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteOrganizerInActivityInCharge(user_id: string, event_id: string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id), activities: { $exists: true }},
                { $set: { "activities.$[element].in_charge": null } },
                { arrayFilters: [{ "element.in_charge": { $eq: new ObjectId(user_id) } }] }
            )

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async getEventWithConditions(conditions: {}, eventCollection) {
        try {
            const events = await eventCollection.find(conditions).toArray();
            return events;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
    async countDocumentsWithConditions(conditions: {}, collection): Promise<number>{
        try{    
            const result = await collection.aggregate([
                {
                    '$match': conditions
                  }, {
                    '$count': '_id'
                  }
            ]).toArray();
            
            if(!isEmptyOrNullField(result)) return result[0]._id;
            return 0;
        } catch(err){

        }
    }
    async getEventPaginated(conditions: {}, eventCollection, pageNumber, nPerPage) {
        try {
            const events = await eventCollection
                            .find(conditions)
                            .skip(pageNumber > 0 ? ((pageNumber - 1) * nPerPage) : 0)
                            .limit(nPerPage)
                            .toArray()
            return events;

        } catch (err) {
            console.log(err)
            throw new BadRequestException(err);
        }
    }

    async getPastEventByUserAndEventIdWhenIamCreator(user_id: string, eventCollection) {
        try {
            const events = await eventCollection
                .find({
                    creator: new ObjectId(user_id),
                    $or: [{ state: 'canceled' }, { state: 'finalized' }]
                })
                .toArray();
            return events;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getPastEventByUserAndEventIdWhenImOrganizer(user_id: string, eventCollection) {
        try {
            const events = await eventCollection
                .find({
                    organizers: {
                        user_id: new ObjectId(user_id),
                    },
                    $or: [{ state: 'canceled' }, { state: 'finalized' }]
                })
                .toArray();
            return events;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getPastEventByUserAndEventIdWhenImGuest(user_id: string, eventCollection) {
        try {
            const event = await eventCollection
                .find({
                    guests: {
                        user_id: new ObjectId(user_id),
                        accepted: true
                    },
                    $or: [{ state: 'canceled' }, { state: 'finalized' }]
                })
                .toArray();
            return event;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async modifiedEventState(event_id: string | ObjectId, event: EventDto, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: event },
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async generateInvitationLink(invitation: InvitationDto, invitationCollection) {
        try {
            return await invitationCollection.insert(invitation)
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async findInvitationLInk(hash: string, invitationCollection) {
        try {
            return await invitationCollection.findOne({
                invitation_id: hash
            })
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateOrganizerPermissions(rolePermissions, event_id: string, eventCollection): Promise<boolean> {
        try {
            const organizerPermissionUpdated = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { ORGANIZER_PERMI: rolePermissions } }
            );

            if (organizerPermissionUpdated.modifiedCount !== 1) return false;
            return true;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateGuestPermissions(rolePermissions, event_id: string, eventCollection): Promise<boolean> {
        try {
            const guestPermissionUpdated = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { GUEST_PERMI: rolePermissions } }
            );

            if (guestPermissionUpdated.modifiedCount !== 1) return false;
            return true;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateServicePermissions(rolePermissions, event_id: string, eventCollection): Promise<boolean> {
        try {
            const servicePermissionUpdated = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { SERVICE_PERMI: rolePermissions } }
            );

            if (servicePermissionUpdated.modifiedCount !== 1) return false;
            return true;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateParticipantsPermissions(event_id: string, guest_id: string | ObjectId, permissions, eventCollection): Promise<boolean> {
        try {
            const response = await eventCollection.updateOne(
                { _id: new ObjectId(event_id), 'guests.user_id': guest_id },
                { $set: { 'guests.$.permissions': permissions } }
            )
            if (response.modifiedCount === 0) return false;
            return true;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getEventsWhenImOrganizerOrCreator(user_id: string, eventCollection) {
        try {
            return await eventCollection
                .find({
                    $or: [{ organizers: { user_id: new ObjectId(user_id) } }, { creator: new ObjectId(user_id) }],
                    $nor: [{ state: 'canceled' }, { state: 'finalized' }]
                })
                .toArray();
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getTemplates(): Promise<TemplateDto[]> {
        try {
            const db = await this.conectionRepository.conectionToDb();
            const templateCollection = db.collection('Templates');

            return await templateCollection.find().toArray();
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async createTemplates(template: TemplateDto, templateCollection): Promise<boolean> {
        try {
            const template_id = await templateCollection.insertOne(template).then(result => result.insertedId);

            if (isEmptyOrNullField(template_id)) return false;
            return true;
        } catch (err) {
            throw new BadRequestException(err)
        }
    }

    async getEventTypes(eventTypeCollection) {
        try {
            return await eventTypeCollection.find().toArray();;
        } catch (err) {
            throw new BadRequestException(err)
        }
    }

    async getAllEvents(dateToday: string, dateTomorrow: string, timeNow: string, eventCollection) {
        const events = eventCollection.aggregate(
            [
                {
                    '$match': {
                        'start_date': {
                            '$gte': dateToday,
                            '$lte': dateTomorrow
                        }
                    }
                }, {
                    '$lookup': {
                        'from': 'Users',
                        'localField': 'guests.user_id',
                        'foreignField': '_id',
                        'as': 'guestsInfo'
                    }
                }, {
                    '$lookup': {
                        'from': 'Users',
                        'localField': 'organizers.user_id',
                        'foreignField': '_id',
                        'as': 'organizersInfo'
                    }
                }, {
                    '$lookup': {
                        'from': 'Users',
                        'localField': 'creator',
                        'foreignField': '_id',
                        'as': 'creatorInfo'
                    }
                }
            ]
        ).toArray();
        return events;
    }

    async createActivity(event_id: string, activity: ActivityDto, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $push: { activities: activity } },
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteActivity(event_id: string, activity_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $pull: { 'activities': { activity_id: activity_id } } }
            );

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteOwnActivity(event_id: string, activity_id: string, in_charge: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $pull: { 'activities': { activity_id: activity_id, in_charge: new ObjectId(in_charge) } } }
            );

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getActivity(event_id: string, activity_id: string, user_id: string, eventCollection) {
        try {
            const activity = await eventCollection.aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectId(event_id)
                        }
                    }, {
                        '$project': {
                            'activity': {
                                '$arrayElemAt': [
                                    '$activities', {
                                        '$indexOfArray': [
                                            '$activities.activity_id', activity_id
                                        ]
                                    }
                                ]
                            }
                        }
                    }, {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'activity.in_charge',
                            'foreignField': '_id',
                            'as': 'in_charge-full'
                        }
                    }, {
                        '$project': {
                            '_id': 0,
                            'activity_id': '$activity.activity_id',
                            'name': '$activity.name',
                            'start_date': '$activity.start_date',
                            'start_time': '$activity.start_time',
                            'end_date': '$activity.end_date',
                            'end_time': '$activity.end_time',
                            'detail': '$activity.detail',
                            'checklist': '$activity.checklist',
                            'complete': '$activity.complete',
                            'in_charge': {
                                '$arrayElemAt': [
                                    '$in_charge-full', 0
                                ]
                            }
                        }
                    }, {
                        '$project': {
                            '_id': 0,
                            'activity_id': '$activity_id',
                            'name': '$name',
                            'start_date': '$start_date',
                            'start_time': '$start_time',
                            'end_date': '$end_date',
                            'end_time': '$end_time',
                            'detail': '$detail',
                            'checklist': '$checklist',
                            'in_charge': {
                                'name': '$in_charge.name',
                                'lastname': '$in_charge.lastname',
                                'username': '$in_charge.username',
                                'user_id': '$in_charge._id'
                            },
                            'complete': '$complete',
                            'isOwn': {
                                '$eq': [
                                    '$in_charge._id', new ObjectId(user_id)
                                ]
                            }
                        }
                    }
                ]
            ).toArray();

            return activity[0];
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async registerInChargeActivity(event_id: string, activity_id: string, in_charge: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id)},
                { $set: { 'activities.$[element].in_charge': new ObjectId(in_charge) } },
                { arrayFilters: [{ "element.activity_id": { $eq: activity_id } }] }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteResponsability(event_id: string, activity_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id)},
                { $set: { 'activities.$[element].in_charge': null } },
                { arrayFilters: [{ "element.activity_id": { $eq: activity_id } }] }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getEventActivities(event_id: string, user_id: string, permissions, eventCollection): Promise<ActivityDto[]> {
        try {
            let activities = await eventCollection.aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectId(event_id)
                        }
                    }, {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'activities.in_charge',
                            'foreignField': '_id',
                            'as': 'activities-full'
                        }
                    }, {
                        '$project': {
                            'activities': {
                                '$map': {
                                    'input': {
                                        '$filter': {
                                            'input': '$activities',
                                            'as': 'activity',
                                            'cond': permissions.role_permissions.VIEW_ALL_TASKS === true ?
                                                { $eq: [1, 1] } : permissions.role_permissions.VIEW_OWN_TASK === true ?
                                                    { $eq: ['$$activity.in_charge', new ObjectId(user_id)] } :
                                                    { $eq: [1, 2] }
                                        }
                                    },
                                    'as': 'activity',
                                    'in': {
                                        'in_charge': {
                                            '$arrayElemAt': [
                                                '$activities-full', {
                                                    '$indexOfArray': [
                                                        '$activities-full._id', '$$activity.in_charge'
                                                    ]
                                                }
                                            ]
                                        },
                                        'activity_id': '$$activity.activity_id',
                                        'name': '$$activity.name',
                                        'complete': '$$activity.complete',
                                        'checklist': '$$activity.checklist',
                                        'start_date': '$$activity.start_date',
                                        'start_time': '$$activity.start_time',
                                        'end_date': '$$activity.end_date',
                                        'end_time': '$$activity.end_time'
                                    }
                                }
                            }
                        }
                    }, {
                        '$project': {
                            '_id': 0,
                            'activities': {
                                '$map': {
                                    'input': '$activities',
                                    'as': 'activity',
                                    'in': {
                                        'in_charge': {
                                            'user_id': '$$activity.in_charge._id',
                                            'username': '$$activity.in_charge.username',
                                            'name': '$$activity.in_charge.name',
                                            'lastname': '$$activity.in_charge.lastname',
                                            'profile_photo': '$$activity.in_charge.small_photo',
                                            'subscriptionType': '$$activity.in_charge.subscriptionType'
                                        },
                                        'activity_id': '$$activity.activity_id',
                                        'name': '$$activity.name',
                                        'complete': '$$activity.complete',
                                        'checklist': '$$activity.checklist',
                                        'start_date': '$$activity.start_date',
                                        'start_time': '$$activity.start_time',
                                        'end_date': '$$activity.end_date',
                                        'end_time': '$$activity.end_time',
                                        'isOwn': {
                                            '$eq': [
                                                '$$activity.in_charge._id', new ObjectId(user_id)
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            ).toArray();

            activities = activities[0];

            if (activities && activities?.length > 0)
                activities.sort((a, b) => new Date(a.start_date + 'T' + a.start_time).getTime() - new Date(b.start_date + 'T' + b.start_time).getTime());

            return activities;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async completeActivity(event_id: string, activity_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id), 'activities.activity_id': activity_id },
                { $set: { 'activities.$.complete': true } }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async completeOwnActivity(event_id: string, activity_id: string, in_charge: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id), 'activities.activity_id': activity_id, 'activities.in_charge': new ObjectId(in_charge) },
                { $set: { 'activities.$.complete': true } }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateActivity(event_id: string, activity: UpdateActivityDTO, activity_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { "activities.$[element]": activity } },
                { arrayFilters: [{ "element.activity_id": { $eq: activity_id } }] }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateOwnActivity(event_id: string, activity: UpdateActivityDTO, activity_id: string, in_charge: ObjectId, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { "activities.$[element]": activity } },
                {
                    arrayFilters: [ {
                        "element.activity_id": activity_id ,
                        "element.in_charge": in_charge
                        }
                    ]
                }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async createConsumable(event_id: string | ObjectId, consumable: ConsumableDto, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $push: { consumables: consumable } },
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteConsumable(event_id: string, consumable_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $pull: { 'consumables': { consumable_id: consumable_id } } }
            );

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getConsumable(event_id: string, consumable_id: string, eventCollection): Promise<ConsumableDto> {
        try {
            let consumable = await eventCollection.aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectId(event_id)
                        }
                    }, {
                        '$project': {
                            'consumable': {
                                '$arrayElemAt': [
                                    '$consumables', {
                                        '$indexOfArray': [
                                            '$consumables.consumable_id', consumable_id
                                        ]
                                    }
                                ]
                            }
                        }
                    }, {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'consumable.subscribers.user_id',
                            'foreignField': '_id',
                            'as': 'subscribers-full'
                        }
                    }, {
                        '$project': {
                            '_id': 0,
                            'consumable_id': '$consumable.consumable_id',
                            'name': '$consumable.name',
                            'description': '$consumable.description',
                            'quantifiable': '$consumable.quantifiable',
                            'subscribers': {
                                '$map': {
                                    'input': '$consumable.subscribers',
                                    'as': 'subscriber',
                                    'in': {
                                        '$mergeObjects': [
                                            '$$subscriber', {
                                                '$arrayElemAt': [
                                                    '$subscribers-full', {
                                                        '$indexOfArray': [
                                                            '$subscribers-full._id', '$$subscriber.user_id'
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }, {
                        '$project': {
                            'consumable_id': '$consumable_id',
                            'name': '$name',
                            'description': '$description',
                            'quantifiable': '$quantifiable',
                            'subscribers': {
                                '$map': {
                                    'input': '$subscribers',
                                    'as': 'subscriber',
                                    'in': {
                                        'user_id': '$$subscriber.user_id',
                                        'username': '$$subscriber.username',
                                        'name': '$$subscriber.name',
                                        'lastname': '$$subscriber.lastname',
                                        'quantity': '$$subscriber.quantity'
                                    }
                                }
                            }
                        }
                    }
                ]
            ).toArray();

            return consumable[0];
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async subscribeToConsumable(event_id: string, consumable_id: string, subscriber, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id), 'consumables.consumable_id': consumable_id },
                { $push: { 'consumables.$.subscribers': subscriber } },
            );

            if (result.modifiedCount !== 0) return true;
            return false;

        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async unsubscribeToConsumable(event_id: string, consumable_id: string, user_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id), 'consumables.consumable_id': consumable_id },
                { $pull: { 'consumables.$.subscribers': { user_id: new ObjectId(user_id) } } }
            );

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateConsumable(event_id: string | ObjectId, consumable_name: string, consumable_description: string, consumable_quantifiable: boolean, consumable_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                {
                    $set: {
                        "consumables.$[element].name": consumable_name,
                        "consumables.$[element].description": consumable_description,
                        "consumables.$[element].quantifiable": consumable_quantifiable
                    }
                },
                { arrayFilters: [{ "element.consumable_id": { $eq: consumable_id } }] }
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async createExpense(event_id: string | ObjectId, expense: ExpenseDto, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $push: { expenses: expense } },
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateExpense(event_id: string | ObjectId, expense: ExpenseDto, expense_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: {
                    "expenses.$[element].name": expense.name,
                    "expenses.$[element].description": expense.description,
                    "expenses.$[element].quantifiable": expense.quantifiable,
                    "expenses.$[element].amount": expense.amount
                    } 
                },
                { arrayFilters: [{ "element.expense_id": { $eq: expense_id } }] }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getExpense(event_id: string, expense_id: string, user_id: string, eventCollection): Promise<ExpenseDto> {
        try {
            let expense = await eventCollection.aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectId(event_id)
                        }
                    }, {
                        '$project': {
                            'expense': {
                                '$arrayElemAt': [
                                    '$expenses', {
                                        '$indexOfArray': [
                                            '$expenses.expense_id', expense_id
                                        ]
                                    }
                                ]
                            }
                        }
                    }, {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'expense.subscribers.user_id',
                            'foreignField': '_id',
                            'as': 'subscribers-full'
                        }
                    }, {
                        '$project': {
                            '_id': 0,
                            'expense_id': '$expense.expense_id',
                            'name': '$expense.name',
                            'description': '$expense.description',
                            'quantifiable': '$expense.quantifiable',
                            'amount': '$expense.amount',
                            'in_charge': '$expense.in_charge',
                            'total_quantity': '$expense.total_quantity',
                            'subscribers': {
                                '$map': {
                                    'input': '$expense.subscribers',
                                    'as': 'subscriber',
                                    'in': {
                                        '$mergeObjects': [
                                            '$$subscriber', {
                                                '$arrayElemAt': [
                                                    '$subscribers-full', {
                                                        '$indexOfArray': [
                                                            '$subscribers-full._id', '$$subscriber.user_id'
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            'isOwn': {
                                '$eq': [
                                    '$expense.in_charge', new ObjectId(user_id)
                                ]
                            }
                        }
                    }, {
                        '$project': {
                            'expense_id': '$expense_id',
                            'name': '$name',
                            'description': '$description',
                            'quantifiable': '$quantifiable',
                            'amount': '$amount',
                            'in_charge': '$in_charge',
                            'total_quantity': '$total_quantity',
                            'isOwn': '$isOwn',
                            'subscribers': {
                                '$map': {
                                    'input': '$subscribers',
                                    'as': 'subscriber',
                                    'in': {
                                        'user_id': '$$subscriber.user_id',
                                        'username': '$$subscriber.username',
                                        'name': '$$subscriber.name',
                                        'lastname': '$$subscriber.lastname',
                                        'quantity': '$$subscriber.quantity'
                                    }
                                }
                            }
                        }
                    }
                ]
            ).toArray();

            return expense[0];
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateExpenseSubscribers(event_id: string, expense: ExpenseDto, expense_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { "expenses.$[element].subscribers": expense.subscribers,
                          "expenses.$[element].total_quantity": expense.total_quantity } },
                { arrayFilters: [{ "element.expense_id": { $eq: expense_id } }] }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getExpenses(event_id: string, eventCollection) {
        try {
            return await eventCollection.aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectId(event_id)
                        }
                    }, {
                        '$project': {
                            '_id': 0,
                            'expenses': '$expenses'
                        }
                    }
                ]
            ).toArray();
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async createExpenseSummary(event_id: string, expensesSummary: EventExpensesSummaryDto, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { "expensesSummary": expensesSummary } }
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getExpensesSummary(event_id: string, eventCollection): Promise<GetExpensesSummaryDto> {
        try {
            return await eventCollection.
                aggregate(
                    [
                        {
                            '$match': {
                                '_id': new ObjectId(event_id)
                            }
                        }, {
                            '$lookup': {
                                'from': 'Users',
                                'localField': 'expensesSummary.summaryXGuest.user_id',
                                'foreignField': '_id',
                                'as': 'expensesSummaryGuests-full'
                            }
                        }, {
                            '$project': {
                                '_id': 0,
                                'expenses': '$expenses',
                                'summary': {
                                    'total': '$expensesSummary.total',
                                    'transactions': {
                                        '$map': {
                                            'input': '$expensesSummary.transactions',
                                            'as': 'transaction',
                                            'in': {
                                                'origin': {
                                                    '$arrayElemAt': [
                                                        '$expensesSummaryGuests-full', {
                                                            '$indexOfArray': [
                                                                '$expensesSummaryGuests-full._id', '$$transaction.origin'
                                                            ]
                                                        }
                                                    ]
                                                },
                                                'recipient': {
                                                    '$arrayElemAt': [
                                                        '$expensesSummaryGuests-full', {
                                                            '$indexOfArray': [
                                                                '$expensesSummaryGuests-full._id', '$$transaction.recipient'
                                                            ]
                                                        }
                                                    ]
                                                },
                                                'amount': '$$transaction.amount',
                                                'complete': '$$transaction.complete',
                                                'transaction_id': '$$transaction.transaction_id'
                                            }
                                        }
                                    }
                                }
                            }
                        }, {
                            '$project': {
                                'expenses': '$expenses',
                                'summary': {
                                    'total': '$summary.total',
                                    'transactions': {
                                        '$map': {
                                            'input': '$summary.transactions',
                                            'as': 'transaction',
                                            'in': {
                                                'origin': {
                                                    'user_id': '$$transaction.origin._id',
                                                    'username': '$$transaction.origin.username',
                                                    'name': '$$transaction.origin.name',
                                                    'lastname': '$$transaction.origin.lastname',
                                                    'small_photo': '$$transaction.origin.small_photo',
                                                    'subscriptionType': '$$transaction.origin.subscriptionType'
                                                },
                                                'recipient': {
                                                    'user_id': '$$transaction.recipient._id',
                                                    'username': '$$transaction.recipient.username',
                                                    'name': '$$transaction.recipient.name',
                                                    'lastname': '$$transaction.recipient.lastname',
                                                    'small_photo': '$$transaction.recipient.small_photo',
                                                    'subscriptionType': '$$transaction.recipient.subscriptionType'
                                                },
                                                'amount': '$$transaction.amount',
                                                'complete': '$$transaction.complete',
                                                'transaction_id': '$$transaction.transaction_id'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                ).toArray();
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateExpenseSummary(event_id: string, eventCollection) {
        try {
            await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { "expensesSummary": null } }
            );
            return undefined;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getExpensesSummaryXGuest(event_id: string, user_id: string, eventCollection): Promise<GetGuestExpensesSummaryDto> {
        try {
            const summaryXGuest = await eventCollection.aggregate(
                [
                    {
                      '$match': {
                        '_id': new ObjectId(event_id)
                      }
                    }, {
                      '$project': {
                        'guest': {
                          '$arrayElemAt': [
                            '$expensesSummary.summaryXGuest', {
                              '$indexOfArray': [
                                '$expensesSummary.summaryXGuest.user_id', new ObjectId(user_id)
                              ]
                            }
                          ]
                        }, 
                        'transactions': {
                          '$filter': {
                            'input': '$expensesSummary.transactions', 
                            'as': 'transaction', 
                            'cond': { $or: [
                                {$eq: ['$$transaction.origin', new ObjectId(user_id)]},
                                {$eq: ['$$transaction.recipient', new ObjectId(user_id)]}
                              ]
                            }
                          }
                        }
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'transactions.origin', 
                        'foreignField': '_id', 
                        'as': 'origins-full'
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'transactions.recipient', 
                        'foreignField': '_id', 
                        'as': 'recipients-full'
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'guest.user_id', 
                        'foreignField': '_id', 
                        'as': 'guest-full'
                      }
                    }, {
                      '$project': {
                        '_id': 0, 
                        'guest': {
                          '$arrayElemAt': [
                            '$origins-full', 0
                          ]
                        }, 
                        'debt': '$guest.debt', 
                        'amountSpent': '$guest.amountSpent', 
                        'balance': '$guest.balance', 
                        'transactions': {
                          '$map': {
                            'input': '$transactions', 
                            'as': 'transaction', 
                            'in': {
                              'origin': {
                                '$arrayElemAt': [
                                  '$origins-full', {
                                    '$indexOfArray': [
                                      '$origins-full._id', '$$transaction.origin'
                                    ]
                                  }
                                ]
                              }, 
                              'recipient': {
                                '$arrayElemAt': [
                                  '$recipients-full', {
                                    '$indexOfArray': [
                                      '$recipients-full._id', '$$transaction.recipient'
                                    ]
                                  }
                                ]
                              }, 
                              'amount': '$$transaction.amount', 
                              'complete': '$$transaction.complete', 
                              'transaction_id': '$$transaction.transaction_id'
                            }
                          }
                        }
                      }
                    }, {
                      '$project': {
                        'guest': {
                          'user_id': '$guest._id', 
                          'username': '$guest.username', 
                          'name': '$guest.name', 
                          'lastname': '$guest.lastname', 
                          'small_photo': '$guest.small_photo',
                          'subscriptionType': '$guest.subscriptionType'
                        }, 
                        'debt': '$debt', 
                        'amountSpent': '$amountSpent', 
                        'balance': '$balance', 
                        'transactions': {
                          '$map': {
                            'input': '$transactions', 
                            'as': 'transaction', 
                            'in': {
                              'origin': {
                                'user_id': '$$transaction.origin._id', 
                                'username': '$$transaction.origin.username', 
                                'name': '$$transaction.origin.name', 
                                'lastname': '$$transaction.origin.lastname', 
                                'small_photo': '$$transaction.origin.small_photo',
                                'subscriptionType': '$$transaction.origin.subscriptionType'
                                
                              }, 
                              'recipient': {
                                'user_id': '$$transaction.recipient._id', 
                                'username': '$$transaction.recipient.username', 
                                'name': '$$transaction.recipient.name', 
                                'lastname': '$$transaction.recipient.lastname', 
                                'small_photo': '$$transaction.recipient.small_photo',
                                'subscriptionType': '$$transaction.recipient.subscriptionType'
                              }, 
                              'amount': '$$transaction.amount', 
                              'complete': '$$transaction.complete', 
                              'transaction_id': '$$transaction.transaction_id'
                            }
                          }
                        }
                      }
                    }
                ]
            ).toArray();

            if (summaryXGuest[0].transactions == null) return undefined;

            return summaryXGuest[0];
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteExpense(event_id: string, expense_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $pull: { 'expenses': { expense_id: expense_id } } }
            );
            if (result.modifiedCount !== 0) return true;
            return false;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async createPoll(event_id: string, poll: PollDto, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $push: { polls: poll } },
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deletePoll(event_id: string, poll_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $pull: { 'polls': { poll_id: poll_id } } }
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updatePoll(event_id: string, updatePoll: PollDto, poll_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { "polls.$[element]": updatePoll } },
                { arrayFilters: [{ "element.poll_id": { $eq: poll_id } }] }
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async respondPoll(event_id:string, poll_id:string, questions: QuestionDto[], user_id:string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id)},
                { $set: { "polls.$[element].questions": questions,
                          "polls.$[element].has_answers": true},
                  $push: { "polls.$[element].users_answered": user_id }        
                },
                { arrayFilters: [{ "element.poll_id": { $eq: poll_id } }] }
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getPoll(event_id: string, poll_id: string, eventCollection): Promise<PollDto> {
        let poll = await eventCollection.aggregate(
            [
                {
                    '$match': {
                        '_id': new ObjectId(event_id)
                    }
                }, {
                    '$project': {
                        '_id': 0,
                        'poll': {
                            '$arrayElemAt': [
                                '$polls', {
                                    '$indexOfArray': [
                                        '$polls.poll_id', poll_id
                                    ]
                                }
                            ]
                        }
                    }
                }, {
                    '$project': {
                        'poll_id': '$poll.poll_id',
                        'name': '$poll.name',
                        'visible': '$poll.visible',
                        'questions': '$poll.questions',
                        'has_answers': '$poll.has_answers'
                    }
                }
            ]
        ).toArray();

        return poll[0];
    }

    async getQuestions(event_id: string, poll_id: string, eventCollection): Promise<PollDto> {
        let poll = await eventCollection.aggregate(
            [
                {
                    '$match': {
                        '_id': new ObjectId(event_id)
                    }
                }, {
                    '$project': {
                        '_id': 0,
                        'poll': {
                            '$arrayElemAt': [
                                '$polls', {
                                    '$indexOfArray': [
                                        '$polls.poll_id', poll_id
                                    ]
                                }
                            ]
                        }
                    }
                }, {
                    '$project': {
                        'questions': '$poll.questions',
                        'users_answered': '$poll.users_answered'
                    }
                }
            ]
        ).toArray();

        return poll[0];
    }

    async getEventPolls(event_id: string, permissions, eventCollection): Promise<any> {
        try {
            let polls = await eventCollection.aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectId(event_id)
                        }
                    }, {
                        '$project': {
                            '_id': 0,
                            'polls': {
                                '$filter': {
                                    'input': '$polls',
                                    'as': 'poll',
                                    'cond': permissions.role_permissions.UPDATE_POLL === true ? 
                                            { $eq: [1, 1] } : 
                                            { $and: [
                                                 { $eq: ['$$poll.visible', true] },
                                                 { $eq: ['$state', 'postEvent'] }
                                                ]}
                                }
                            },
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'polls': {
                                '$map': {
                                    'input': '$polls',
                                    'as': 'poll',
                                    'in': {
                                        'poll_id': '$$poll.poll_id',
                                        'name': '$$poll.name',
                                        'visible': '$$poll.visible',
                                        'questions': '$$poll.questions',
                                        'has_answers': '$$poll.has_answers'
                                    }
                                }
                            }
                        }
                    }
                ]
            ).toArray();

            return polls[0];
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async addServiceToEvent(event_id: string, service, eventCollection) {
        try {
            await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $push: { services: service } }
            );
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getServiceInEvent(event_id:string, service_id: string , eventCollection): Promise<EventDto[]>{
        try {
            return await eventCollection.find(
                {
                    _id: new ObjectId(event_id),
                    "services.service_id": new ObjectId(service_id)
                }
            ).toArray();
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async respondConfirmation(event_id: string, service_id: string, accepted: boolean, eventCollection): Promise<boolean> {
        try {
            const response = await eventCollection.updateOne(
                {
                    _id: new ObjectId(event_id),
                    'services.service_id': new ObjectId(service_id)
                },
                { $set: { 'services.$.accepted': accepted } }
            );
            if (response.modifiedCount === 0) return false;
            return true;
        } catch (err) {
            throw new BadRequestException(err)
        }
    }

    async deleteServiceToEvent(event_id: string, service_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $pull: { 'services': { service_id: new ObjectId(service_id) } } }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async createTransport(event_id: string, transport: TransportDto, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $push: { transports: transport } },
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteTransport(event_id: string, transport_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $pull: { 'transports': { transport_id: transport_id } } }
            );

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async updateTransport(event_id: string, transport: TransportDto, transport_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { 
                    "transports.$[element].name": transport.name,
                    "transports.$[element].description": transport.description,
                    "transports.$[element].available_seats": transport.available_seats,
                    "transports.$[element].starting_place": transport.starting_place,
                    "transports.$[element].start_date": transport.start_date,
                    "transports.$[element].start_time": transport.start_time,
                    "transports.$[element].phone_contact": transport.phone_contact,
                    "transports.$[element].patent": transport.patent
                    } 
                },
                { arrayFilters: [{ "element.transport_id": { $eq: transport_id } }] }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getTransport(event_id: string, transport_id: string, user_id: string, eventCollection): Promise<TransportDto> {
        try {
            let transport = await eventCollection.aggregate(
                [
                    {
                      '$match': {
                        '_id': new ObjectId(event_id)
                      }
                    }, {
                      '$project': {
                        'transport': {
                          '$arrayElemAt': [
                            '$transports', {
                              '$indexOfArray': [
                                '$transports.transport_id', transport_id
                              ]
                            }
                          ]
                        }
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'transport.subscribers.user_id', 
                        'foreignField': '_id', 
                        'as': 'subscribers-full'
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'transport.in_charge', 
                        'foreignField': '_id', 
                        'as': 'in_charge-full'
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'transport.applications.user_id', 
                        'foreignField': '_id', 
                        'as': 'applications-full'
                      }
                    }, {
                      '$project': {
                        '_id': 0, 
                        'transport_id': '$transport.transport_id', 
                        'name': '$transport.name', 
                        'description': '$transport.description', 
                        'available_seats': '$transport.available_seats', 
                        'starting_place': '$transport.starting_place', 
                        'start_date': '$transport.start_date', 
                        'start_time': '$transport.start_time', 
                        'phone_contact': '$transport.phone_contact', 
                        'patent': '$transport.patent', 
                        'in_charge': {
                          '$arrayElemAt': [
                            '$in_charge-full', 0
                          ]
                        }, 
                        'subscribers': {
                          '$map': {
                            'input': '$transport.subscribers', 
                            'as': 'subscriber', 
                            'in': {
                              '$mergeObjects': [
                                '$$subscriber', {
                                  '$arrayElemAt': [
                                    '$subscribers-full', {
                                      '$indexOfArray': [
                                        '$subscribers-full._id', '$$subscriber.user_id'
                                      ]
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        }, 
                        'applications': {
                          '$map': {
                            'input': '$transport.applications', 
                            'as': 'application', 
                            'in': {
                              '$mergeObjects': [
                                '$$application', {
                                  '$arrayElemAt': [
                                    '$applications-full', {
                                      '$indexOfArray': [
                                        '$applications-full._id', '$$application.user_id'
                                      ]
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        }, 
                        'isOwn': {
                          '$eq': [
                            '$transport.in_charge', new ObjectId(user_id)
                          ]
                        }
                      }
                    }, {
                      '$project': {
                        'transport_id': '$transport_id', 
                        'name': '$name', 
                        'description': '$description', 
                        'available_seats': '$available_seats', 
                        'starting_place': '$starting_place', 
                        'start_date': '$start_date', 
                        'start_time': '$start_time', 
                        'phone_contact': '$phone_contact', 
                        'patent': '$patent', 
                        'in_charge': {
                          'name': '$in_charge.name', 
                          'lastname': '$in_charge.lastname', 
                          'username': '$in_charge.username', 
                          'user_id': '$in_charge._id'
                        }, 
                        'isOwn': '$isOwn', 
                        'subscribers': {
                          '$map': {
                            'input': '$subscribers', 
                            'as': 'subscriber', 
                            'in': {
                              'user_id': '$$subscriber.user_id', 
                              'username': '$$subscriber.username', 
                              'name': '$$subscriber.name', 
                              'lastname': '$$subscriber.lastname', 
                              'address': '$$subscriber.address'
                            }
                          }
                        }, 
                        'applications': {
                          '$map': {
                            'input': '$applications', 
                            'as': 'application', 
                            'in': {
                              'user_id': '$$application.user_id', 
                              'username': '$$application.username', 
                              'name': '$$application.name', 
                              'lastname': '$$application.lastname', 
                              'address': '$$application.address', 
                              'message': '$$application.message'
                            }
                          }
                        }
                      }
                    }
                  ]
            ).toArray();

            return transport[0];
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async subscribeToTransport(event_id: string, transport_id: string, application, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id), 'transports.transport_id': transport_id },
                { $push: { 'transports.$.applications': application } }
            );
            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async unsubscribeToTransport(event_id: string, transport_id: string, user_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id), 'transports.transport_id': transport_id },
                { $pull: { 'transports.$.subscribers': { user_id: new ObjectId(user_id) } } }
            );

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async infoMailAnswerApplicationSubscriber(event_id: string, user_id: string, subscriber_user_id: string, eventCollection) {
        try {
            const infoMail = await eventCollection.aggregate(
                [
                    {
                      '$match': {
                        '_id': new ObjectId(event_id)
                      }
                    }, {
                      '$project': {
                        'event_title': '$title', 
                        'start_date': '$start_date',
                        'start_time': '$start_time',
                        'id_in_charge': new ObjectId(user_id), 
                        'id_subscriber': new ObjectId(subscriber_user_id)
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'id_in_charge', 
                        'foreignField': '_id', 
                        'as': 'info_in_charge'
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'id_subscriber', 
                        'foreignField': '_id', 
                        'as': 'info_subscriber'
                      }
                    }, {
                      '$project': {
                        '_id': 0, 
                        'event_title': '$event_title', 
                        'start_date': '$start_date',
                        'start_time': '$start_time',
                        'in_charge': {
                          '$arrayElemAt': [
                            '$info_in_charge', 0
                          ]
                        }, 
                        'subscriber': {
                          '$arrayElemAt': [
                            '$info_subscriber', 0
                          ]
                        }
                      }
                    }, {
                      '$project': {
                            'event_title': '$event_title', 
                            'start_date': '$start_date',
                            'start_time': '$start_time',
                            'in_charge': {
                            'name': '$in_charge.name', 
                            'lastname': '$in_charge.lastname',
                            'username': '$in_charge.username',
                            'email': '$in_charge.email'
                            }, 
                            'subscriber': {
                            'name': '$subscriber.name', 
                            'lastname': '$subscriber.lastname',
                            'username': '$subscriber.username', 
                            'email': '$subscriber.email'
                        }
                      }
                    }
                ]
            ).toArray();

            return infoMail[0];
        } 
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async acceptTransportApplication(event_id: string, transport_id: string, subscriber_user_id: string, subscriber_address: AddressDto, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id), 'transports.transport_id': transport_id },
                {
                    $push: {
                        'transports.$.subscribers': {
                            user_id: new ObjectId(subscriber_user_id),
                            address: subscriber_address
                        }
                    },
                    $pull: { 'transports.$.applications': { user_id: new ObjectId(subscriber_user_id) } }
                }
            );

            if (result.modifiedCount == 0) return false;
            return true;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async rejectTransportApplication(event_id: string, transport_id: string, subscriber_user_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id), 'transports.transport_id': transport_id },
                { $pull: { 'transports.$.applications': { user_id: new ObjectId(subscriber_user_id) } } }
            );

            if (result.modifiedCount == 0) return false;

            return true;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getEventTransports(event_id: string, eventCollection): Promise<any> {
        try {
            let transports = await eventCollection.aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectId(event_id)
                        }
                    }, 
                    {
                        '$project': {
                            '_id': 0,
                            'transports': {
                                '$map': {
                                    'input': '$transports',
                                    'as': 'transport',
                                    'in': {
                                        'transport_id': '$$transport.transport_id',
                                        'name': '$$transport.name',
                                        'description': '$$transport.description',
                                        'available_seats': '$$transport.available_seats',
                                        'starting_place': '$$transport.starting_place',
                                        'start_date': '$$transport.start_date',
                                        'start_time': '$$transport.start_time',
                                        'phone_contact': '$$transport.phone_contact',
                                        'patent': '$$transport.patent',
                                        'in_charge': '$$transport.in_charge',
                                        'subscribers': '$$transport.subscribers'
                                    }
                                }
                            }
                        }
                    }
                ]
            ).toArray();

            return transports[0];
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getEventServices(event_id: string, eventCollection): Promise<any> {
        try {
            let services = await eventCollection.aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectId(event_id)
                        }
                    }, 
                    {
                        '$lookup': {
                            'from': 'Services',
                            'localField': 'services.service_id',
                            'foreignField': '_id',
                            'as': 'services-full'
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'services': {
                                '$map': {
                                    'input': '$services',
                                    'as': 'service',
                                    'in': {
                                        '$mergeObjects': [
                                            '$$service', {
                                                '$arrayElemAt': [
                                                    '$services-full', {
                                                        '$indexOfArray': [
                                                            '$services-full._id', '$$service.service_id'
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }    
                    },{
                        '$project': {
                            '_id': 0,
                            'services': {
                                '$map': {
                                    'input': '$services',
                                    'as': 'service',
                                    'in': {
                                        'service_id': '$$service.service_id',
                                        'name': '$$service.name',
                                        'type': '$$service.type',
                                        'accepted': '$$service.accepted',
                                        'rating': '$$service.rating',
                                        'rating_event': '$$service.rating_event',
                                        'description': '$$service.description',
                                        'date_service': '$$service.date_service',
                                        'time_service': '$$service.time_service'
                                    }
                                }
                            },
                        }
                    }
                ]
            ).toArray();

            return services[0];
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getEventOrganizers(event_id: string, eventCollection){
        try {
            let organizers = await eventCollection.aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectId(event_id)
                        }
                    }, 
                    {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'organizers.user_id',
                            'foreignField': '_id',
                            'as': 'organizers-full'
                        }
                    },
                    {
                        '$project': {
                            'organizers': {
                                '$map': {
                                    'input': '$organizers',
                                    'as': 'organizer',
                                    'in': {
                                        '$mergeObjects': [
                                            '$$organizer', {
                                                '$arrayElemAt': [
                                                    '$organizers-full', {
                                                        '$indexOfArray': [
                                                            '$organizers-full._id', '$$organizer.user_id'
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }, {
                        '$project': {
                            '_id': 0,
                            'organizers': {
                                '$map': {
                                    'input': '$organizers',
                                    'as': 'organizer',
                                    'in': {
                                        'user_id': '$$organizer.user_id',
                                        'username': '$$organizer.username',
                                        'name': '$$organizer.name',
                                        'lastname': '$$organizer.lastname',
                                        'profile_photo': '$$organizer.small_photo',
                                        'subscriptionType': '$$organizer.subscriptionType'
                                    }
                                }
                            }
                        }
                    }
                ]
            ).toArray();

            return organizers[0];
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async createPhotoAlbum(event_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { "photo_album": true, "photos_storage_used": 0 } },
            );

            if (result.modifiedCount == 0) return false;
            return true;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async createFileRepository(event_id: string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id)},
                { $set: {"files_repository": true, "files_storage_used": 0}},
            );
            
            if (result.modifiedCount == 0) return false;
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteFileRepository(event_id: string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id)},
                { $set: {"files_repository": false}}
            );
            
            if (result.modifiedCount == 0) return false;
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deletePhotoAlbum(event_id: string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id)},
                { $set: {"photo_album": false}}
            );
            
            if (result.modifiedCount == 0) return false;
            return true;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async getEmailsParticipants(event_id: string | ObjectId, eventCollection){
        try{
            const result = await eventCollection.aggregate(
                [
                    {
                      '$match': {
                        '_id': new ObjectId(event_id)
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'guests.user_id', 
                        'foreignField': '_id', 
                        'as': 'guests_full'
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'organizers.user_id', 
                        'foreignField': '_id', 
                        'as': 'organizers_full'
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'creator', 
                        'foreignField': '_id', 
                        'as': 'creator_full'
                      }
                    }, {
                      '$lookup': {
                        'from': 'Users', 
                        'localField': 'services.provider', 
                        'foreignField': '_id', 
                        'as': 'services_full'
                      }
                    }, {
                      '$project': {
                        'guests_full.email': 1, 
                        'guests_full._id':1,
                        'organizers_full.email': 1, 
                        'organizers_full._id': 1,
                        'guests_organizers._id':1,
                        'creator_full.email': 1,
                        'creator_full._id':1, 
                        'services_full.email': 1,
                        'title': 1
                      }
                    }
                  ]
            ).toArray();
            return result;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async getInfoProvider(event_id: string, service_id: string, eventCollection){
        const result = await eventCollection.aggregate(
            [
                {
                  '$match': {
                    '_id': new ObjectId(event_id), 
                    'services.service_id': new ObjectId(service_id)
                  }
                }, {
                  '$lookup': {
                    'from': 'Users', 
                    'localField': 'services.provider', 
                    'foreignField': '_id', 
                    'as': 'services_full'
                  }
                }, {
                    '$lookup': {
                      'from': 'Services', 
                      'localField': 'services.service_id', 
                      'foreignField': '_id', 
                      'as': 'service_info'
                    }
                }, {
                  '$project': {
                    'services_full.provider': 1,
                    'services_full.email': 1, 
                    'services_full.username': 1, 
                    'service_info.name': 1,
                    'title': 1
                  }
                }
              ]
        ).toArray()
        return result;
    }

    async getUserInEvent(user_id: string, now: string, eventCollection: any) {
        try {
            const result = await eventCollection.aggregate([
                {
                    '$match': {
                        '$or': [
                            {
                                'creator': new ObjectId(user_id)
                            }, {
                                'organizers.user_id': new ObjectId(user_id)
                            }, {
                                'guests.user_id': new ObjectId(user_id)
                            }
                        ],
                        '$nor': [
                            {
                                'state': 'canceled'
                            }, {
                                'state': 'finalized'
                            }
                        ],
                        'start_date': {
                            '$gte': now
                        }
                    }
                }
            ]).toArray();
            return result;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async qualifyService(event_id: string, service_id: string, rating: number, eventCollection) {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $set: { "services.$[element].rating_event": rating } },
                { arrayFilters: [{ "element.service_id": { $eq: new ObjectId(service_id) } }] }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async countEventsByUserWhenIamCreator(user_id: string, eventCollection) {
        try {
            const events = await eventCollection
                .find({
                    creator: new ObjectId(user_id),
                    $nor: [{ state: 'canceled' }, { state: 'finalized' }]
                })
                .count();
            return events;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async getEventForPermissions(event_id: string | ObjectId, eventCollection) {
        try {
            return await eventCollection
                .aggregate(
                    [
                        {
                          '$match': {
                            '_id': new ObjectId(event_id)
                          }
                        }, {
                          '$lookup': {
                            'from': 'Users', 
                            'localField': 'creator', 
                            'foreignField': '_id', 
                            'as': 'creator_full'
                          }
                        }, {
                          '$project': {
                            'creator': '$creator', 
                            'creator_full': {
                              '$arrayElemAt': [
                                '$creator_full', 0
                              ]
                            }, 
                            'services': '$services', 
                            'guests': '$guests', 
                            'organizers': '$organizers', 
                            'state': '$state', 
                            'type': '$type', 
                            'CREATOR_PERMI': '$CREATOR_PERMI', 
                            'GUEST_PERMI': '$GUEST_PERMI', 
                            'SERVICE_PERMI': '$SERVICE_PERMI', 
                            'ORGANIZER_PERMI': '$ORGANIZER_PERMI',
                            'PUBLIC_GUEST_PERMI': '$PUBLIC_GUEST_PERMI', 
                          }
                        }, {
                          '$project': {
                            'creator': '$creator', 
                            'creatorSubscriptionType': '$creator_full.subscriptionType', 
                            'services': '$services', 
                            'guests': '$guests', 
                            'organizers': '$organizers', 
                            'state': '$state', 
                            'type': '$type', 
                            'CREATOR_PERMI': '$CREATOR_PERMI', 
                            'GUEST_PERMI': '$GUEST_PERMI', 
                            'SERVICE_PERMI': '$SERVICE_PERMI', 
                            'ORGANIZER_PERMI': '$ORGANIZER_PERMI',
                            'PUBLIC_GUEST_PERMI': '$PUBLIC_GUEST_PERMI'
                          }
                        }
                    ]
                )
                .toArray();
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async completeTransaction(completeTransaction: CompleteTransactionDto, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(completeTransaction.event_id)},
                { $set: { "expensesSummary.transactions.$[element].complete": true } },
                { arrayFilters: [{ "element.transaction_id": { $eq: completeTransaction.transaction_id } }] }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        }
        catch (err) {
            throw new BadRequestException(err);
        }
    }

    async getPhotoStorageInEventById(event_id: string, eventCollection){
        try{
            const result = await eventCollection.aggregate(
                [
                    {
                      '$match': {
                        '_id': new ObjectId(event_id)
                      }
                    }, {
                      '$project': {
                        'photos_storage_used': '$photos_storage_used'
                      }
                    }
                  ]
            ).toArray();

            return result[0].photos_storage_used;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async getFileStorageInEventById(event_id: string, eventCollection){
        try{
            const result = await eventCollection.aggregate(
                [
                    {
                      '$match': {
                        '_id': new ObjectId(event_id)
                      }
                    }, {
                      '$project': {
                        'files_storage_used': '$files_storage_used'
                      }
                    }
                  ]
            ).toArray();

            return result[0].files_storage_used;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async updatePhotoStorageUse(event_id: string, photos_storage_used: number, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id)},
                { $set: { "photos_storage_used": photos_storage_used } }
            );

            if (result.modifiedCount !== 0) return true;

            return false;
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async updateFilesStorageUse(event_id: string, files_storage_used: number, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                { _id: new ObjectId(event_id)},
                { $set: { "files_storage_used": files_storage_used } }
            );

            if (result.modifiedCount !== 0) return true;

            return false;
        } catch(err){
            throw new BadRequestException(err);
        }
    }
}


