import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './modules/event/event.module';
import { GuestModule } from './modules/guest/guest.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConsumableModule } from './modules/consumable/consumable.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { PhotosModule } from './modules/photos/photos.module';
import { ServiceModule } from './modules/service/service.module';
import { ConfigModule } from '@nestjs/config';
import { MessagesModule } from './messages/messages.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { TransportModule } from './modules/transport/transport.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PollModule } from './modules/poll/poll.module';
import { PaginationModule } from './pagination/pagination.module';
import { FilesModule } from './modules/files/files.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    EventModule,
    GuestModule,
    ActivityModule,
    ConsumableModule,
    ExpenseModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      serveStaticOptions: {index: 'index.html'},
      exclude: ["/api*"]
    }),
    PhotosModule,
    ServiceModule,
    MessagesModule,
    PermissionsModule,
    TransportModule,
    PollModule,
    PaginationModule,
    FilesModule,
    SubscriptionModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
