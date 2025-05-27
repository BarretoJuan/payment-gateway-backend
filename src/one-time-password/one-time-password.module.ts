import { Module } from '@nestjs/common';
import { OneTimePasswordService } from './one-time-password.service';
import { OneTimePasswordController } from './one-time-password.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OneTimePassword } from './entities/one-time-password.entity';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([OneTimePassword]), UserModule, AuthModule],
  controllers: [OneTimePasswordController],
  providers: [OneTimePasswordService],
  exports: [OneTimePasswordService],
})
export class OneTimePasswordModule {}
