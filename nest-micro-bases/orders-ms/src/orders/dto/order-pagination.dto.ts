import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderStatusList } from '../enum/order.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Status must be one of the following: ${OrderStatusList.join(', ')}`,
  })
  status: OrderStatus;
}
