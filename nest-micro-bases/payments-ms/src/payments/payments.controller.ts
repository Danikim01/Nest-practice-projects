import { Controller, Req, Res, Post, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Response } from 'express';
import { RequestWithRawBody } from './interfaces/raw-request.interface';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  //@Post('create-payment-session')
  @MessagePattern('create.payment.session')
  createPaymentSession(@Payload() data: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(data);
  }

  @Get('success')
  success() {
    return 'success';
  }

  @Get('failure')
  failure() {
    return 'failure';
  }

  @Get('cancel')
  cancel() {
    return 'cancel';
  }

  // Endpoint HTTP para webhooks de Stripe
  @Post('payments/webhook')
  async stripeWebhook(@Req() req: RequestWithRawBody, @Res() res: Response) {
    return this.paymentsService.stripeWebhook(req, res);
  }
}
