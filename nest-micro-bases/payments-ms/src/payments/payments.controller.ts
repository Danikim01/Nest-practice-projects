import { Controller, Post, Get, Body, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() body: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(body);
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

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebhook(req, res);
  }
}
