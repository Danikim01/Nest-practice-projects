import { IsString, IsUUID, IsUrl } from 'class-validator';

export class PaidOrderDto {
  @IsString()
  stripePaymentId: string;

  @IsUUID()
  @IsString()
  orderId: string;

  @IsUrl()
  receiptUrl: string;
}
