import { Module } from '@nestjs/common';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { PermissionsRepository } from '../../repositories/permissions/permissions.repository.impl';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
  controllers: [PermissionsController],
  providers: [
    {
      provide: 'PermissionsInterface',
      useClass: PermissionsService,
    },
    {
      provide: 'ConectionRepositoryInterface',
      useClass: ConectionRepository
    },
    {
      provide: 'PermissionsRepositoryInterface',
      useClass: PermissionsRepository
    },
    {
      provide: 'EventRepositoryInterface',
      useClass: EventRepository
    }
  ]
})
export class PermissionsModule {}
