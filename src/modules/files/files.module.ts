import { Module } from '@nestjs/common';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { ConectionFileRepository } from '../../connection-db-files/conection-files.repository.impl';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { FilesRepository } from '../../repositories/files/files.repository.impl';
import { GuestRepository } from '../../repositories/guest/guest.repository.impl';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { EventModule } from '../event/event.module';
import { EventService } from '../event/event.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [EventModule],
  controllers: [FilesController],
  providers: [
    {
      provide: 'FilesServiceInterface',
      useClass: FilesService
    },
    {
      provide: 'ConectionFileRepositoryInterface',
      useClass: ConectionFileRepository
    },
    {
      provide: 'FilesRepositoryInterface',
      useClass: FilesRepository
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
  ]
})
export class FilesModule {}
