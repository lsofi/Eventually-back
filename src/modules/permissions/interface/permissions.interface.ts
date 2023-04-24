export interface PermissionsInterface {
    insertPermissionsInEvents(): Promise<boolean>;
    getUserPermissions(event_id:string, user_id:string);
    hola();
}
