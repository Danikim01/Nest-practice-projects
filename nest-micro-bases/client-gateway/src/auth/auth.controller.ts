import { Controller, Post, Get } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config/services';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post('register')
  registerUser() {
    return this.client.send('auth.register.user', {});
  }

  @Post('login')
  loginUser() {
    return this.client.send('auth.login.user', {});
  }

  @Get('verify-token')
  verifyToken() {
    return this.client.send('auth.verify.token', {});
  }
}
