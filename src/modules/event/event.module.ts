import { Module } from '@nestjs/common';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { TaksService } from '../../crons/send-email-reminder.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Module({
  controllers: [EventController],
  providers: [
    {
      provide: 'EventServiceInterface',
      useClass: EventService
    }, 
    {
      provide: 'ConectionRepositoryInterface',
      useClass: ConectionRepository
    },
    {
      provide: 'EventRepositoryInterface',
      useClass: EventRepository
    },
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository
    },
    TaksService,
    NotificationsGateway,
    EventService
  ],
  exports: [EventService]
})
export class EventModule {}
