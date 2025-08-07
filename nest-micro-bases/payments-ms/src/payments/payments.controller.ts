import { Controller, Post, Get, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';

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
  async webhook(@Body() body: any) {
    return body;
  }
}
