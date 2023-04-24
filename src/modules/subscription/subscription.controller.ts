import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { HttpStatusCode } from 'axios';

@ApiTags('Manejo de suscripciones')
@Controller('subscription')
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('createSubscription')
    async createSubscription(@Req() request: Request, @Body() datosSuscripcion) {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return await this.subscriptionService.createSubscription(datosSuscripcion, jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @Post('notifications')
    async notifications(@Req() request: Request, @Body() data) {
        try {
            const result = await this.subscriptionService.notifications(data);
            if ( result === true ) return HttpStatusCode.Ok;

        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('cancelSubscription')
    async cancelSubscription(@Req() request: Request, @Body() data) {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return await this.subscriptionService.cancelSubscription(jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('getSubscription')
    async getSubscription(@Req() request: Request) {
        try {
            const jwt = request.headers['authorization'].split(' ')[1];
            return await this.subscriptionService.getSubscription(jwt);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
}
