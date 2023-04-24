import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { ConectionRepositoryInterface } from "../../conection-db/conection.repository,interface";
import { PermissionsRepositoryInterface } from "./permissions.repository.interface";

@Injectable()
export class PermissionsRepository implements PermissionsRepositoryInterface {
    constructor(
        @Inject('ConectionRepositoryInterface')
        private readonly conectionRepository: ConectionRepositoryInterface,
    ) { }
    async insertPermissionsInEvents(creator_permissions, organizer_permissions, guest_permissions, service_permissions, guest_public_permissions, eventCollection){
                try {
            const permissions = await eventCollection.updateMany(
                {},
                { $set: { "CREATOR_PERMI": creator_permissions, "ORGANIZER_PERMI": organizer_permissions, "GUEST_PERMI": guest_permissions, "SERVICE_PERMI": service_permissions, "PUBLIC_GUEST_PERMI": guest_public_permissions } }
            )
            console.log(permissions);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
}   