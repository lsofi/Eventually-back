import { Module } from '@nestjs/common';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { EventService } from '../event/event.service';
import { ConsumableController } from './consumable.controller';
import { ConsumableService } from './consumable.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Module({
  controllers: [ConsumableController],
  providers: [
    {
      provide: 'ConsumableServiceInterface',
      useClass: ConsumableService,
    },
    {
      provide: 'ConectionRepositoryInterface',
      useClass: ConectionRepository
    },
    {
      provide: 'EventService',
      useClass: EventService
    },
    {
      provide: 'EventRepositoryInterface',
      useClass: EventRepository
    },
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository
    },
    NotificationsGateway
  ]
})
export class ConsumableModule {}
