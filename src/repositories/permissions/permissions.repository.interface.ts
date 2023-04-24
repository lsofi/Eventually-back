export interface PermissionsRepositoryInterface {
    insertPermissionsInEvents(creator_permissions, organizer_permissions, guest_permissions, service_permissions, guest_public_permissions, eventCollection);
}