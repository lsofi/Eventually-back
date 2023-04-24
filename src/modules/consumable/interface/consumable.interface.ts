import { ConsumableDto } from "../dto/consumable.dto";
import { DeleteConsumableDto } from "../dto/request/deleteConsumable.dto";
import { SubscribeToConsumableDto } from "../dto/request/subscribeToConsumable.dto";
import { UnSubscribeToConsumableDto } from "../dto/request/unsubscribeToConsumable.dto";

export interface ConsumableServiceInterface {
    createConsumable(consumable: ConsumableDto, jwt: string): Promise<boolean>;
    deleteConsumable(deleteConsumable: DeleteConsumableDto, jwt: string): Promise<boolean>;
    getConsumable(event_id: string, consumable_id: string): Promise<ConsumableDto>;
    subscribeToConsumable(subscribeToConsumable: SubscribeToConsumableDto, jwt: string): Promise<boolean>;
    unsubscribeToConsumable(unsubscribeToConsumable: UnSubscribeToConsumableDto, jwt:string): Promise<boolean>;
    getEventConsumables(event_id: string, jwt:string): Promise <ConsumableDto[]>;
    updateConsumable(updateConsumable: ConsumableDto, jwt: string) : Promise<boolean>;
}