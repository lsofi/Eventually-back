import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { EventService } from '../event/event.service';
import { UserService } from '../user/user.service';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EventModule } from '../event/event.module';


@Module({
  imports: [
    JwtModule.register({
    secret: process.env.JWT_SECRET
  }),
  EventModule
],
  controllers: [ActivityController],
  providers: [
    {
      provide: 'ActivityServiceInterface',
      useClass: ActivityService,
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
  ],
})
export class ActivityModule {}
