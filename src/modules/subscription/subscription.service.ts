import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { ObjectId } from 'mongodb';
import { ConectionRepositoryInterface } from 'src/conection-db/conection.repository,interface';
import { UserRepositoryInterface } from 'src/repositories/user/user.repository.interface';
import { subscriptionCancel } from 'src/shared/email/subscriptionCancel';
import { subscriptionConfirmation } from 'src/shared/email/subscriptionConfirmation';
import { decodeJWT } from 'src/shared/shared-methods.util';

@Injectable()
export class SubscriptionService {
  
  constructor(
    @Inject('ConectionRepositoryInterface')
    private readonly conectionRepository: ConectionRepositoryInterface,
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface) {}

  async createSubscription(datosSuscripcion, jwt) {
    const url = "https://api.mercadopago.com/preapproval";

    const body = {
        reason: "Suscripción premium Eventually",
        auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 3000,
            currency_id: "ARS"
        },
        back_url: "https://www.eventually.social/home",
        payer_email: datosSuscripcion.email
    };

    const subscription = await axios.post(url, body, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
        }
    });

    const db = await this.conectionRepository.conectionToDb();
    const subscriptionsCollection = db.collection('Subscriptions');

    const user_id = decodeJWT(jwt).sub;
  
    const subscriptionBD = {
      user_id: new ObjectId(user_id),
      email: datosSuscripcion.email,
      subscription_id: subscription.data.id
    };

    await subscriptionsCollection.insertOne(subscriptionBD);

    return subscription.data;
  }

  async notifications(data): Promise<boolean>{
    if (data.type === 'subscription_preapproval'){
      const url = "https://api.mercadopago.com/preapproval/" + data.data.id
      const subscription = await axios.get(url, {
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
          }
      });

      if (subscription.data.status === 'authorized') {
        const db = await this.conectionRepository.conectionToDb();
        const userCollection = db.collection('Users');
        const subscriptionsCollection = db.collection('Subscriptions');
    
        let subscriptionBD = await subscriptionsCollection.findOne({
          subscription_id: data.data.id
        });

        subscriptionBD.paid = true;

        const user = await this.userRepository.findUserById(subscriptionBD.user_id, userCollection);

        const promises = [];

        let updateSubscription = subscriptionsCollection.updateOne(
          { subscription_id : subscriptionBD.subscription_id },
          { $set: subscriptionBD}
        );
        promises.push(updateSubscription);

        let registerUserPremium = this.userRepository.registerUserPremium(subscriptionBD.user_id, userCollection);
        promises.push(registerUserPremium);

        console.log("--------------------------------");
        console.log(user);
        console.log(user.username);
        console.log(user.email);
        console.log("--------------------------------");
        let sendMail = subscriptionConfirmation(user.username, user.email);
        promises.push(sendMail);

        await Promise.allSettled(promises);
      }

      if (subscription.data.status === 'paused' || subscription.data.status === 'cancelled') {
        const db = await this.conectionRepository.conectionToDb();
        const userCollection = db.collection('Users');
        const subscriptionsCollection = db.collection('Subscriptions');

        let subscriptionBD = await subscriptionsCollection.findOne({
          subscription_id: data.data.id
        });

        subscriptionBD.paid = false;

        const user = await this.userRepository.findUserById(subscriptionBD.user_id, userCollection);

        const promises = [];

        let updateSubscription = subscriptionsCollection.updateOne(
          { subscription_id : subscriptionBD.subscription_id },
          { $set: subscriptionBD}
        );
        promises.push(updateSubscription);

        let cancelUserPremium = this.userRepository.cancelUserPremium(subscriptionBD.user_id, userCollection);
        promises.push(cancelUserPremium);

        let sendMail = subscriptionCancel(user.username, user.email);
        promises.push(sendMail);

        await Promise.allSettled(promises);
      }
    }
    return true;
  }

  async cancelSubscription(jwt){
    const user_id = decodeJWT(jwt).sub;

    const db = await this.conectionRepository.conectionToDb();
    const subscriptionsCollection = db.collection('Subscriptions');

    const user = await subscriptionsCollection.findOne({
      user_id: new ObjectId(user_id),
      paid: true
    });

    const url = "https://api.mercadopago.com/preapproval/" + user.subscription_id;

    const body = {
      status: 'cancelled'
    };

    await axios.put(url, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
      }
    });

    return true;
  }

  async getSubscription(jwt){
    const user_id = decodeJWT(jwt).sub;

    const db = await this.conectionRepository.conectionToDb();
    const subscriptionsCollection = db.collection('Subscriptions');

    const user = await subscriptionsCollection.findOne({
      user_id: new ObjectId(user_id),
      paid: true
    });

    const url = "https://api.mercadopago.com/preapproval/" + user.subscription_id;

    const subscription = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
      }
    });

    return subscription.data;
  }
}
