import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from 'src/config';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecretKey);

  async createPaymentSession(body: PaymentSessionDto) {
    const { currency, items } = body;

    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
          description: item.name + ' description',
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {},
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:${envs.port}/payments/success`,
      cancel_url: `http://localhost:${envs.port}/payments/cancel`,
    });
    return session;
  }
}
