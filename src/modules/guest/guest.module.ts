import { Module } from '@nestjs/common';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { EventService } from '../event/event.service';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { GuestRepository } from '../../repositories/guest/guest.repository.impl';
import { AddToEventByMailStrategy } from '../../shared/addToEvent/AddToEventByMailStrategy';
import { AddToEventByUsernameStrategy } from '../../shared/addToEvent/AddToEventByUsernameStrategy';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule],
  controllers: [GuestController],
  providers: [
    {
      provide: 'GuestServiceInterface',
      useClass: GuestService,
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
    {
      provide: 'GuestRepositoryInterface',
      useClass: GuestRepository
    },
    NotificationsGateway,

  ],
})
export class GuestModule {}
