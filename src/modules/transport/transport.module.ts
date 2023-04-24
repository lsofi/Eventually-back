import { Module } from '@nestjs/common';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule],
  controllers: [TransportController],
  providers: [
    {
      provide: 'TransportServiceInterface',
      useClass: TransportService,
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
    NotificationsGateway
  ]
})
export class TransportModule {}
