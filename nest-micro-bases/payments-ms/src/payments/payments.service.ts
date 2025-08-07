import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from 'src/config';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecretKey);

  async createPaymentSession() {
    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {},
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Product',
              description: 'Test Product description',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:${envs.port}/payments/success`,
      cancel_url: `http://localhost:${envs.port}/payments/cancel`,
    });
    return session;
  }
}
