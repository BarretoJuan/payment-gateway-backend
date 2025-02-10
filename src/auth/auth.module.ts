// src/auth/auth.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => UserModule)], // Import your entities here
  providers: [AuthService, SupabaseService], // Provide AuthService and SupabaseService
  controllers: [AuthController], // Register the AuthController
  exports: [AuthService], // Export AuthService if needed in other modules
})
export class AuthModule {}
