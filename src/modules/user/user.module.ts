import { Module } from '@nestjs/common';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { AuthModule } from '../../auth/auth.module';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { AuthService } from '../../auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET
    })
  ],
  controllers: [UserController],
  providers: [
    {
      provide: 'UserServiceInterface',
      useClass: UserService
    }, 
    {
      provide: 'ConectionRepositoryInterface',
      useClass: ConectionRepository
    },
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository
    },
    {
      provide: 'EventRepositoryInterface',
      useClass: EventRepository
    },
  ]
})
export class UserModule {}
