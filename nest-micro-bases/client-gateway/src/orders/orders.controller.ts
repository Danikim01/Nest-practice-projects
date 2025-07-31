import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_SERVICE } from 'src/config/services';
import { ClientProxy } from '@nestjs/microservices';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(ORDER_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('create-order', createOrderDto);
  }

  @Get()
  findAll() {
    return this.client.send('find-all-orders', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('find-one-order', { id: +id });
  }
}
