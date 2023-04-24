import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Role } from "../roles/role.enum";
export class UpdatePermissionsRole {
    @ApiProperty({
        example: 'creator',
        required: true,
        description: 'El rol al que pertenece el permiso a actualizar'
    })
    @IsNotEmpty({
        message: '$property#El rol no puede estar vacío.'
    })
    @IsEnum(Role, {
        message: '$property#No se ingresó un rol válido.'
    })
    role: Role;

    @ApiProperty({
        example: '6335fde18eb59798f6b08097',
        required: true,
        description: 'Es el id del evento'
    })
    @IsNotEmpty({
        message: '$property#El id del evento no puede estar vacío.'
    })
    @IsString({
        message: '$property#El id del evento no es válido.'
    })
    event_id: string;

    @ApiProperty({
        example: '{ "ADD_SERVICE_TO_EVENT": true }',
        required: true,
        description: 'Es el permiso que se quiere actualizar para el rol ingresado.'
    })
    @IsNotEmpty({
        message: '$property#El/los permisos no pueden estar vacíos.'
    })
    permissions;
}