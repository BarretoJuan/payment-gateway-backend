import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OneTimePasswordService } from './one-time-password.service';
import { CreateOneTimePasswordDto } from './dto/create-one-time-password.dto';
import { UpdateOneTimePasswordDto } from './dto/update-one-time-password.dto';
import { UserService } from '../user/user.service';

@Controller('one-time-password')
export class OneTimePasswordController {
  constructor(private readonly oneTimePasswordService: OneTimePasswordService, private readonly userService: UserService) {}

  @Post('generate')
  async generateOTP(@Body() body: { identificationNumber: string}) {

    const user = await this.userService.findOneByIdentification(body.identificationNumber);

    if (!user) {
      throw new Error('User not found');
    }
    return await this.oneTimePasswordService.generateOTP(user);
  }

  @Post('validate')
  async validateOTP(@Body() body: { identificationNumber: string, code: number, password: string }) {
    const user = await this.userService.findOneByIdentification(body.identificationNumber);

    if (!user) {
      return false
    }

    return await this.oneTimePasswordService.validateOTP(user, body.code, body.password);
  }

}
