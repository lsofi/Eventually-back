import { Module } from '@nestjs/common';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { UserService } from '../user/user.service';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { ServiceRepository } from '../../repositories/service/service.repository.impl';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EventModule } from '../event/event.module';
import { MessageRepository } from '../../repositories/message/message.repository.impl';

@Module({
  imports: [
    JwtModule.register({
    secret: process.env.JWT_SECRET
  }),
  EventModule
],
  controllers: [ServiceController],
  providers: [{
    provide: 'ServiceServiceInterface',
    useClass: ServiceService,
  },
  {
    provide: 'ConectionRepositoryInterface',
    useClass: ConectionRepository
  },
  {
    provide: 'UserServiceInterface',
    useClass: UserService
  },
  {
    provide: 'UserRepositoryInterface',
    useClass: UserRepository
  },
  {
    provide: 'EventRepositoryInterface',
    useClass: EventRepository
  },
  {
    provide: 'ServiceRepositoryInterface',
    useClass: ServiceRepository
  },
  NotificationsGateway,
  {
    provide: 'MessageRepositoryInterface',
    useClass: MessageRepository
  }
]
})
export class ServiceModule {}
