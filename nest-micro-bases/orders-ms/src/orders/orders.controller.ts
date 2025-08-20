import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import {
  OrderPaginationDto,
  ChangeOrderStatusDto,
  CreateOrderDto,
} from './dto';
import { RpcException, EventPattern } from '@nestjs/microservices';
import { PaidOrderDto } from './dto';
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('create-order')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order);

    return {
      order,
      paymentSession,
    };
  }

  @MessagePattern('find-all-orders')
  async findAll(@Payload() orderPaginationDto: OrderPaginationDto) {
    try {
      const products = await this.ordersService.findAll(orderPaginationDto);
      return products;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('find-one-order')
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('change-order-status')
  changeOrderStatus(@Payload() changeOrderStatusDto: ChangeOrderStatusDto) {
    return this.ordersService.changeOrderStatus(changeOrderStatusDto);
  }

  @EventPattern('payment.success')
  paidOrder(@Payload() paidOrderDto: PaidOrderDto) {
    return this.ordersService.paidOrder(paidOrderDto);
  }
}
