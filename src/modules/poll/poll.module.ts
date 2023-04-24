import { Module } from '@nestjs/common';
import { PollController } from './poll.controller';
import { PollService } from './poll.service';
import { EventService } from '../event/event.service';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule],
  controllers: [PollController],
  providers: [
    {
      provide: 'PollServiceInterface',
      useClass: PollService,
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
  ]
})
export class PollModule {}
