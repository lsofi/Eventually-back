import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { GetMyEventDTO } from "../../modules/event/dto/response/getMyEvent.dto";
import { ConectionRepositoryInterface } from "../../conection-db/conection.repository,interface";
import { GuestRepositoryInterface } from "./guest.repository.interface";

@Injectable()
export class GuestRepository implements GuestRepositoryInterface {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
    ) { }

    async updateGuestInEvent(event_id: string, eventCollection, user) {
        try {
            await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $push: { guests: { user_id: new ObjectId(user._id), accepted: null } } },
            );
        } catch (err) {
            throw new BadRequestException(err);
        }

    }
    
    async updateGuestInEventWhenUserWasNotRegister(event_id: string, eventCollection, user, accepted: boolean){
        try {
            await eventCollection.updateOne(
                { _id: new ObjectId(event_id) },
                { $push: { guests: { user_id: new ObjectId(user), accepted: accepted } } },
            );
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteGuest(event_id: string, guest_id: string, eventCollection): Promise<boolean> {
        try {
            const result = await eventCollection.updateOne(
                {   _id: new ObjectId(event_id) },
                {   $pull: {  'guests': { user_id: new ObjectId(guest_id) }}
                }
            );

            if (result.modifiedCount !== 0) return true;
            return false;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async deleteGuestInConsumables(event_id:string, guest_id:string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id)},
                {$pull: {"consumables.$[element].subscribers": { user_id: new ObjectId(guest_id) }}},
                { arrayFilters: [{ "element.subscribers": { $elemMatch: { "user_id" : new ObjectId(guest_id)} } } ] }
            )

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteGuestInExpenses(event_id:string, guest_id:string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id)},
                {$pull: {"expenses.$[element].subscribers": { user_id: new ObjectId(guest_id) }}},
                { arrayFilters: [{ "element.subscribers": { $elemMatch: { "user_id" : new ObjectId(guest_id)} } } ] }
            )

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteGuestInTransportSubscribers(event_id:string, guest_id:string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id),  "transports.$.subscribers": { user_id: new ObjectId(guest_id) }},
                {$pull: {"transports.$[element].subscribers": { user_id: new ObjectId(guest_id) }}},
                { arrayFilters: [{ "element.subscribers": { $elemMatch: { "user_id" : new ObjectId(guest_id)} } } ] }
            )

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteGuestInTransportApplication(event_id:string, guest_id:string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id),  "transports.$.applications": { user_id: new ObjectId(guest_id) }},
                {$pull: {"transports.$[element].applications": { user_id: new ObjectId(guest_id) }}},
                { arrayFilters: [{ "element.subscribers": { $elemMatch: { "user_id" : new ObjectId(guest_id)} } } ] }
            )

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async deleteGuestInActivityInCharge(event_id:string, guest_id:string, eventCollection): Promise<boolean>{
        try{
            const result = await eventCollection.updateOne(
                {_id: new ObjectId(event_id), activities: { $exists: true }},
                { $set: { "activities.$[element].in_charge": null } },
                { arrayFilters: [{ "element.in_charge": { $eq: new ObjectId(guest_id) } }] }
            )

            if (result.modifiedCount !== 0) return true;
            return false;

        } catch(err){
            throw new BadRequestException(err);
        }
    }

    async getGuests(event_id: string, eventCollection) {
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
                                'localField': 'guests.user_id',
                                'foreignField': '_id',
                                'as': 'guests-full'
                            }
                        }, {
                            '$project': {
                                '_id': 0,
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
                                }
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
                                            'profile_photo': '$$guest.small_photo'
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

    async getEventByLink(invitation_hash: string, collectionInvitations) {
        try {
            return await collectionInvitations.find({
                invitation_id: invitation_hash
            }).toArray();
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async respondInvitationByMail(eventCollection, event_id: string, user_id: string, accepted: boolean): Promise<boolean> {
        try {
            const response = await eventCollection.updateOne(
                {
                    _id: new ObjectId(event_id),
                    'guests.user_id': new ObjectId(user_id)
                },
                {
                    $set: { 'guests.$.accepted': accepted }
                },
            );
            if (response.modifiedCount !== 0) return true;
            return false;
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    async respondInvitationByLink(eventCollection, event_id: string, user_id: string, accepted: boolean): Promise<boolean> {
        try {
            const response = await eventCollection.update(
                { _id: new ObjectId(event_id) },
                {
                    $push: {
                        guests: { user_id: new ObjectId(user_id), accepted: accepted }
                    }
                },
            );

            if (response.modifiedCount !== 0) return true;
            return false;

        } catch (err) {
            throw new BadRequestException(err)
        }
    }
}