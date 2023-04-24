
export interface AddToEventStrategyInterface{
    addToEvent(event, guest, user_id, userCollection, eventCollection): Promise<boolean> ;
}