import { Module } from '@nestjs/common';
import { ConectionRepository } from 'src/conection-db/conection.repository.impl';
import { UserRepository } from 'src/repositories/user/user.repository.impl';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    {
      provide: 'ConectionRepositoryInterface',
      useClass: ConectionRepository
    },
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository
    }]
})
export class SubscriptionModule {}
