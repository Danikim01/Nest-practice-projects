import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities';
import * as bcryptjs from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcryptjs.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        message: 'User created successfully',
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) throw new BadRequestException('User not found');

    if (!bcryptjs.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid');

    const payload: JwtPayload = { id: user.id };
    const tokens = this.getJwtToken(payload);

    return {
      user: { id: user.id, email: user.email },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: { email: payload.email },
        select: { id: true, email: true, isActive: true },
      });

      if (!user) throw new UnauthorizedException('User not found');
      if (!user.isActive) throw new UnauthorizedException('User is not active');

      const newPayload: JwtPayload = { id: user.id };
      return this.getJwtToken(newPayload);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private getJwtToken(payload: JwtPayload) {
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '1h', // Access token corto
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d', // Refresh token largo
      }),
    };
  }

  private handleDBErrors(errors: any): never {
    if (errors.code === '23505') {
      throw new BadRequestException(errors.detail);
    }
    throw new InternalServerErrorException(
      'Something went wrong, check server logs',
    );
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }
}
