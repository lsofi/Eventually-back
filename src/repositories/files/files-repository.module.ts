import { Module } from '@nestjs/common';
import { ConectionFileRepository } from '../../connection-db-files/conection-files.repository.impl';
import { FilesRepository } from './files.repository.impl';


@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: 'ConectionFileRepositoryInterface',
      useClass: ConectionFileRepository
    },
    {
      provide: 'FilesRepositoryInterface',
      useClass: FilesRepository
    }
  ]
})
export class FilesRepositoryModule {}
