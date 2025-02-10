// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() user: CreateUserDto) {
    return this.authService.signUp(user);
  }

  @Post('signin')
  async signIn(@Body('identification') identification: string, @Body('password') password: string) {
    return this.authService.signIn(identification, password);
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard) // Protect this route with the AuthGuard
  async logout(@Req() request: Request) {
    const accessToken = request.headers['authorization']?.split(' ')[1];
    return this.authService.logout(accessToken);
  }
}