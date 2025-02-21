// src/auth/auth.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { UserModule } from '../user/user.module';
import { CompanyService } from 'src/company/company.service';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company]),
    forwardRef(() => UserModule),
    forwardRef(() => CompanyModule),
  ], // Import your entities here
  providers: [AuthService, SupabaseService, CompanyService], // Provide AuthService, SupabaseService and CompanyService
  controllers: [AuthController], // Register the AuthController
  exports: [AuthService, CompanyService], // Export AuthService if needed in other modules
})
export class AuthModule {}
