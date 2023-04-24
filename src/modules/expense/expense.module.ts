import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { EventService } from '../event/event.service';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule],
  controllers: [ExpenseController],
  providers: [
    {
      provide: 'ExpenseServiceInterface',
      useClass: ExpenseService,
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
export class ExpenseModule {}
