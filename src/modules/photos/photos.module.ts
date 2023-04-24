import { Module } from '@nestjs/common';
import { EventRepository } from '../../repositories/event/event.repository.impl';
import { UserRepository } from '../../repositories/user/user.repository.impl';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { EventService } from '../event/event.service';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { PhotosRepository } from '../../repositories/photos/photos.repository.impl';
import { ConectionPhotosRepository } from '../../connection-db-photos/conection-photos.repository.impl';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule],
  controllers: [PhotosController],
  providers: [
    PhotosService,
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
      provide: 'PhotosRepositoryInterface',
      useClass: PhotosRepository
    },
    {
      provide: 'ConectionPhotosRepositoryInterface',
      useClass: ConectionPhotosRepository
    },
  ]
})
export class PhotosModule {}
