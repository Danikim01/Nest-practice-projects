import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(
        `Product already exists ${JSON.stringify(error.detail)}`,
      );
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      return await this.productRepository.find({
        take: limit,
        skip: offset,
      });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(term: string) {
    let product: Product | null;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      //make the search case insensitive
      product = await queryBuilder
        .where(`title =:title or slug =:slug`, {
          title: term,
          slug: term,
        })
        .orWhere('LOWER(title) = LOWER(:title)', { title: term })
        .orWhere('LOWER(slug) = LOWER(:slug)', { slug: term })
        .getOne();
    }
    if (!product) {
      throw new NotFoundException(`Product with id ${term} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    await this.productRepository.delete(id);
    return 'Product deleted successfully';
  }
}
