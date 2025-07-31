import { Controller, NotImplementedException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('create-order')
  create(@Payload() createOrderDto: CreateOrderDto) {
    return createOrderDto;
  }

  @MessagePattern('find-all-orders')
  findAll() {
    return this.ordersService.findAll();
  }

  @MessagePattern('find-one-order')
  findOne(@Payload() id: number) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('change-order-status')
  changeOrderStatus() {
    throw new NotImplementedException();
  }
}
