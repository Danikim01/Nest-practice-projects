import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;
    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);
    const skip = (page - 1) * limit;
    const products = await this.product.findMany({
      skip,
      take: limit,
      where: { available: true },
    });
    return {
      data: products,
      meta: {
        page,
        lastPage,
        totalItems: totalPages,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    } else if (!product.available) {
      throw new NotFoundException(`Product with id ${id} is not available`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...toUpdate } = updateProductDto;

    await this.findOne(id);
    return this.product.update({
      where: { id },
      data: toUpdate,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // return this.product.delete({
    //   where: { id },
    // });

    //soft delete:
    const deletedProduct = await this.product.update({
      where: { id },
      data: { available: false },
    });
    return deletedProduct;
  }
}
