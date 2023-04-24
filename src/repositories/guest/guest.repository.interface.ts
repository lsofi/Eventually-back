

export interface GuestRepositoryInterface {
    updateGuestInEvent(event_id:string, eventCollection, user);
    deleteGuest(event_id:string, guest_id:string, eventCollection): Promise<boolean>;
    getGuests(event_id:string, eventCollection);
    getEventByLink(invitation_hash:string, collectionInvitations);
    respondInvitationByMail(eventCollection, event_id: string, user_id: string, accepted: boolean): Promise<boolean>;
    respondInvitationByLink(eventCollection, event_id: string, user_id: string, accepted: boolean): Promise<boolean>;
    deleteGuestInConsumables(event_id:string, guest_id:string, eventCollection): Promise<boolean>;
    deleteGuestInExpenses(event_id:string, guest_id:string, eventCollection): Promise<boolean>;
    deleteGuestInTransportSubscribers(event_id:string, guest_id:string, eventCollection): Promise<boolean>;
    deleteGuestInTransportApplication(event_id:string, guest_id:string, eventCollection): Promise<boolean>;
    deleteGuestInActivityInCharge(event_id:string, guest_id:string, eventCollection): Promise<boolean>;
    updateGuestInEventWhenUserWasNotRegister(event_id: string, eventCollection, user, accepted: boolean);
}