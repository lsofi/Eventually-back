import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ConectionRepository } from '../conection-db/conection.repository.impl';
import { MessageRepository } from '../repositories/message/message.repository.impl';
import { UserRepository } from '../repositories/user/user.repository.impl';
import { ChatController } from './messages.controller';
import { ServiceRepository } from '../repositories/service/service.repository.impl';
import { EventService } from '../modules/event/event.service';
import { EventRepository } from '../repositories/event/event.repository.impl';
import { GeneralGateway } from '../modules/gateway/general-gateway.gateway';
import { GatewayModule } from 'src/modules/gateway/gateway.module';
import { NotificationsGateway } from '../modules/notifications/notifications.gateway';
import { EventModule } from 'src/modules/event/event.module';

@Module({
  imports: [EventModule],
  controllers: [ChatController],
  providers: [
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
      provide: 'EventRepositoryInterface',
      useClass: EventRepository
    },
    GeneralGateway
  ],
})
export class MessagesModule {}
