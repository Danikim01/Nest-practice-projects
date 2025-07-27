import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { User } from 'src/auth/entities';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertNewUsers();
    await this.insertNewProducts(adminUser);
    return 'Seed executed';
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertNewUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      const { password, ...userData } = user;
      users.push(
        this.userRepository.create({
          password: bcrypt.hashSync(password, 10),
          ...userData,
        }),
      );
    });
    const dbUsers = await this.userRepository.save(users);
    return dbUsers[0];
  }

  private async insertNewProducts(adminUser: User) {
    await this.productsService.deleteAllProducts();
    const products = initialData.products;

    const insertPromises: Promise<any>[] = [];

    products.forEach((product: CreateProductDto) => {
      insertPromises.push(this.productsService.create(product, adminUser));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
