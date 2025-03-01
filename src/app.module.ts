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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
