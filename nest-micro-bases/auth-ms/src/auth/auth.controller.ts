import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register.user')
  registerUser() {
    return 'register User';
  }

  @MessagePattern('auth.login.user')
  loginUser() {
    return 'login User';
  }

  @MessagePattern('auth.verify.token')
  verifyToken() {
    return 'verify Token';
  }
}
