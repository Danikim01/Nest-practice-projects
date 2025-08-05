import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { NATS_SERVICE } from 'src/config/services';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { OrderPaginationDto, StatusDto } from './dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('create-order', createOrderDto);
  }

  @Get()
  findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    return this.client.send('find-all-orders', orderPaginationDto);
  }

  @Get('id/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send('find-one-order', { id }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get(':status')
  findByStatus(
    @Param() status: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.client
      .send('find-all-orders', { status: status.status, ...paginationDto })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Patch(':id')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto,
  ) {
    return this.client
      .send('change-order-status', { id, status: statusDto.status })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }
}
