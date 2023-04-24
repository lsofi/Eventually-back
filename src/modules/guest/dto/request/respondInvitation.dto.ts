import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsHash, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RespondInvitationDTO{
    @ApiProperty({
        name: 'user_id',
        example: '6332436c16bee7344710da2b',
        required: true,
        type: String
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor del id del usuario no es válido.'
    })
    user_id?: string;

    @ApiProperty({
        name: 'event_id',
        example: '6335fde18eb59798f6b08097',
        required: true,
        type: String
    })
    @IsOptional()
    @IsString({
        message: '$property#El valor ingresado en el $property no es válido.',
    })
    event_id: string;

    @ApiProperty({
        name: 'accepted',
        example: 'true',
        required: true,
        type: Boolean
    })
    @IsNotEmpty({
        message: '$property#La contestación de la invitación no puede estar vacía.'
    })
    @IsBoolean({
        message: '$property#La contestación de la invitación no es válida.'
    })
    accepted: boolean;

    @ApiProperty({
        name: 'hash',
        example: '$2b$12$UmPhIQKG2A1lsz7mec1nh.C8TSYYhnpuOB7dcB38do7dxLVIB5W6S',
        required: false,
        type: String
    })
    @IsOptional()
    @IsString({
        message: '$property#El hash de la invitación no es válido.'
    })
    invitation_hash?:string

    @IsOptional()
    @IsString({
        message: '$property#El email de la invitación no es válido.'
    })
    email?:string
}