import { Module } from '@nestjs/common';
import { ConectionRepository } from '../../conection-db/conection.repository.impl';


@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: 'ConectionRepositoryInterface',
      useClass: ConectionRepository
    },
  ]
})
export class UserRepositoryModule {}
