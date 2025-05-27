import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UserModule } from "./user/user.module";
import { CourseModule } from "./course/course.module";
import { TransactionModule } from "./transaction/transaction.module";
import { UserCourseModule } from "./user-course/user-course.module";
import { AuthModule } from "./auth/auth.module";
import { SupabaseService } from "./supabase/supabase.service";
import { CompanyModule } from "./company/company.module";
import { InstallmentModule } from "./installment/installment.module";
import { HttpModule } from "@nestjs/axios";
import { ScheduleModule } from "@nestjs/schedule";
import { OneTimePasswordModule } from './one-time-password/one-time-password.module';
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [ MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: +(process.env.SMTP_PORT || '587'), 
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || ""),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [],
    }),
    UserModule,
    CourseModule,
    TransactionModule,
    UserCourseModule,
    AuthModule,
    CompanyModule,
    InstallmentModule,
    OneTimePasswordModule,
  ],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
