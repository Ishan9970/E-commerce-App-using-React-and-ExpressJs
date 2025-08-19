import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string; role: string }) {
    try {
      return await this.authService.login(body.email, body.password, body.role);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
