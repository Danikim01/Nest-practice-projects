import {
  Injectable,
  OnModuleInit,
  Logger,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { NATS_SERVICE } from 'src/config/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OrderWithProducts } from './interfaces/order-with-products.interface';
import { PaidOrderDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(NATS_SERVICE) private readonly productsClient: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Orders service connected to the database');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      // 1 confirmar los ids de los products
      const ids = createOrderDto.items.map((item) => item.productId);
      const products: any[] = await firstValueFrom(
        this.productsClient.send({ cmd: 'validate-product' }, ids),
      );

      //2 calculo de los valores
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const realProductPrice = products.find(
          (product) => product.id === orderItem.productId,
        );

        return acc + realProductPrice.price * orderItem.quantity;
      }, 0);

      //3 crear la orden
      const totalItems = createOrderDto.items.reduce(
        (acc, orderItem) => acc + orderItem.quantity,
        0,
      );

      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          status: 'PENDING',
          orderItems: {
            createMany: {
              data: createOrderDto.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: products.find((product) => product.id === item.productId)
                  .price,
              })),
            },
          },
        },
        include: {
          orderItems: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      return {
        ...order,
        orderItem: order.orderItems.map((item) => ({
          ...item,
          name: products.find((product) => product.id === item.productId).name,
        })),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status,
      },
    });

    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;

    return {
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status,
        },
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: {
        id,
      },
      include: {
        orderItems: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });

    if (!order) {
      throw new RpcException({
        message: `Order with id: ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    const productIds = order.orderItems.map((item) => item.productId);
    const products: any[] = await firstValueFrom(
      this.productsClient.send({ cmd: 'validate-product' }, productIds),
    );

    return {
      ...order,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        name: products.find((product) => product.id === item.productId).name,
      })),
    };
  }

  async changeOrderStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;

    const order = await this.findOne(id);

    if (order.status === status) {
      throw new RpcException({
        message: `Order with id: ${id} already has status: ${status}`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return this.order.update({
      where: { id },
      data: {
        status,
      },
    });
  }

  async createPaymentSession(order: OrderWithProducts) {
    const paymentSession = await firstValueFrom(
      this.productsClient.send('create.payment.session', {
        orderId: order.id,
        currency: 'usd',
        items: order.orderItem.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      }),
    );

    return paymentSession;
  }

  async paidOrder(paidOrderDto: PaidOrderDto) {
    this.logger.log('Order paid');
    this.logger.log(paidOrderDto);
    const { stripePaymentId, orderId, receiptUrl } = paidOrderDto;

    const order = await this.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID' as OrderStatus,
        paid: true,
        paidAt: new Date(),
        stripeChardId: stripePaymentId,

        // La relacion
        orderReceipt: {
          create: {
            receiptUrl,
          },
        },
      },
    });

    return order;
  }
}
