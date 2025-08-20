import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from 'src/config';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Response } from 'express';
import { RequestWithRawBody } from './interfaces/raw-request.interface';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecretKey);
  private readonly logger = new Logger(PaymentsService.name);

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
        metadata: {
          orderId: body.orderId,
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });
    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      sessionId: session.id,
      url: session.url,
    };
  }

  async stripeWebhook(req: RequestWithRawBody, res: Response) {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody || req.body,
        sig,
        envs.stripeWebhookSecret,
      );
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge;
        const payload = {
          stripePaymentId: charge.id,
          orderId: charge.metadata.orderId,
          receiptUrl: charge.receipt_url,
        };
        this.logger.log(payload);
        break;
      case 'charge.failed':
        const failedCharge = event.data.object as Stripe.Charge;
        console.log('Charge failed:', failedCharge.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  }
}
