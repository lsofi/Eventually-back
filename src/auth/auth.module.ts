import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConectionRepository } from '../conection-db/conection.repository.impl';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { FacebookStrategy } from './strategy/facebook.strategy';

require('dotenv').config();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET
    })
  ],
  providers: [
    {
      provide: 'AuthService',
      useClass: AuthService
    },
    {
      provide: 'ConectionRepositoryInterface',
      useClass: ConectionRepository
    },
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy
  ],
  controllers: [AuthController]
})
export class AuthModule {}
