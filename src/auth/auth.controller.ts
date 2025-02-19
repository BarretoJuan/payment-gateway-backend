/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
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

  @Post('signup-admin')
  @UseGuards(AuthGuard)
  async signUpAdmin(@Body() user: CreateUserDto, @Req() request: Request) {
    const accessToken: string = request.headers['authorization']?.split(' ')[1];
    const decodedToken = await this.authService.validateUser(accessToken);

    if (decodedToken.user?.role?.toLocaleLowerCase() !== 'admin') {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    return this.authService.signUpAdmin(user);
  }

  @Post('signin')
  async signIn(
    @Body('identification') identification: string,
    @Body('password') password: string,
  ) {
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
