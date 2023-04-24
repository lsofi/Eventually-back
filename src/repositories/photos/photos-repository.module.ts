import { Module } from '@nestjs/common';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';
import { PhotosRepository } from './photos.repository.impl';


@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: 'ConectionRepositoryInterface',
      useClass: ConectionRepository
    },
    {
      provide: 'PhotosRepositoryInterface',
      useClass: PhotosRepository
    }
  ]
})
export class PhotosRepositoryModule {}
