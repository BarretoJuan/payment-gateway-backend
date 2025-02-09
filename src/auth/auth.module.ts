// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User])], // Import your entities here
  providers: [AuthService, SupabaseService], // Provide AuthService and SupabaseService
  controllers: [AuthController], // Register the AuthController
  exports: [AuthService], // Export AuthService if needed in other modules
})
export class AuthModule {}