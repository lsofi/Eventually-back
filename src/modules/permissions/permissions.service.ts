import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import { PermissionsRepositoryInterface } from '../../repositories/permissions/permissions.repository.interface';
import { CREATOR, GUEST, ORGANIZER, PUBLIC_GUEST, SERVICE } from '../../auth/dto/permissons';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { isEmptyOrNullField } from '../../shared/shared-methods.util';
import { PermissionsInterface } from './interface/permissions.interface';

@Injectable()
export class PermissionsService implements PermissionsInterface {
    constructor(
        @Inject('PermissionsRepositoryInterface')
        private readonly permissionsRepositoryInterface: PermissionsRepositoryInterface,
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
        @Inject('EventRepositoryInterface')
        private readonly eventRepositoryInterface: EventRepositoryInterface 
    ){}

    async insertPermissionsInEvents(): Promise<boolean> {
        const db = await this.conectionRepository.conectionToDb();
        const eventCollection = db.collection('Events');
        const creator_permissions = { ...CREATOR };
        const organizer_permissions = { ...ORGANIZER };
        const guest_permissions = { ...GUEST };
        const service_permissions = { ...SERVICE };
        const guest_public_permissions = {...PUBLIC_GUEST};

        await this.permissionsRepositoryInterface.insertPermissionsInEvents(creator_permissions, organizer_permissions, guest_permissions, service_permissions, guest_public_permissions, eventCollection);

        return null;
    }

    async getUserPermissions(event_id: string, user_id: string) {
        const db = await this.conectionRepository.conectionToDb();
        const eventCollection = db.collection('Events');
        const event = await this.eventRepositoryInterface.getEventById(event_id, eventCollection);

        if (!isEmptyOrNullField(event)) {
            let role_permissions;
            let isGuest;
            if (event.guests) {
                for (let guest of event.guests) {
                    if ((guest.user_id).equals(user_id)) isGuest = guest;
                }
            }
            if (!isEmptyOrNullField(isGuest)) {
                if (isGuest.permissions) {
                    role_permissions = Object.assign(event.GUEST_PERMI, isGuest.permissions);
                } else {
                    role_permissions = event.GUEST_PERMI;
                }
            }

            if (event.organizers) {
                const isOrganizer = event.organizers.find(x => new ObjectId(x.user_id).equals(user_id));
                if (!isEmptyOrNullField(isOrganizer)) {
                    if (isOrganizer.permissions) {
                        role_permissions = Object.assign(event.ORGANIZER_PERMI, isOrganizer.permissions);
                    } else {
                        role_permissions = event.ORGANIZER_PERMI;
                    }
                }
            }

            const isCreator = new ObjectId(event.creator).equals(user_id);
            if (isCreator) role_permissions = event.CREATOR_PERMI;

            return role_permissions;
        }
    }

    async hola(){
        const db = await this.conectionRepository.conectionToDb();
        const userCollection = db.collection('Users');
        try{
            const hola = await userCollection.updateMany(
                {},
                { $set: {"notifications": []}}
            );
            console.log(hola)
        } catch(err){
            throw new BadRequestException(err);
        }
    }
}
