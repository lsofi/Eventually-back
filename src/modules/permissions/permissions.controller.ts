import { BadRequestException, Controller, Get, Inject, Put, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { isEmptyOrNullField } from '../../shared/shared-methods.util';
import { PermissionsInterface } from './interface/permissions.interface';

@Controller('permissions')
@ApiTags('Manejo de permisos')
export class PermissionsController {
    constructor(
        @Inject('PermissionsInterface')
        private permissionsServiceInterface: PermissionsInterface
    ){}

    @Put('insertPermissionsIntoEvents')
    async insertPermissionsIntoEvents(): Promise<boolean>{
        try{
            return await this.permissionsServiceInterface.insertPermissionsInEvents();
        } catch(err){
            throw new BadRequestException(err);
        }
    }

    @Get('getUserPermissions')
    @ApiQuery({ name: 'event_id', required: true, example: '631516c39b6b86b5a973e836', type: String })
    @ApiQuery({ name: 'user_id', required: true, example: '6331fd1fb2f678d1d2c01f46', type: String })
    async getUserPermissions(@Query('event_id') event_id: string, @Query('user_id') user_id: string){
        try{
            if(isEmptyOrNullField(event_id)) throw new BadRequestException(['event_id#El id del evento no puede estar vacío.']);
            if(isEmptyOrNullField(user_id)) throw new BadRequestException(['user_id#El id del usuario no puede estar vacío.'])

            return await this.permissionsServiceInterface.getUserPermissions(event_id, user_id);
        } catch(err){
            throw new BadRequestException(err);
        }
    }


    @Get('hola')
    async hola(){
        this.permissionsServiceInterface.hola();
    }
}
