import { Module } from '@nestjs/common';
import { MessageRepository } from '../../repositories/message/message.repository.impl';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { MessagesService } from '../../messages/messages.service';
import { GeneralGateway } from './general-gateway.gateway';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { ServiceRepository } from '../../repositories/service/service.repository.impl';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { EventService } from '../event/event.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Module({
  providers: [
    GeneralGateway,
    MessagesService,
    {
      provide: 'ConectionRepositoryInterface',
      useClass: ConectionRepository
    },
    {
      provide: 'MessageRepositoryInterface',
      useClass: MessageRepository
    },
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository
    },
    {
      provide: 'ServiceRepositoryInterface',
      useClass: ServiceRepository
    },
    {
      provide: 'EventService',
      useClass: EventService
    },
    {
      provide: 'EventRepositoryInterface',
      useClass: EventRepository
    },
    NotificationsGateway
  ]
})
export class GatewayModule { }
