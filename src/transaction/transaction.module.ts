import { Module } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { TransactionController } from "./transaction.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { AuthModule } from "../auth/auth.module";
import { HttpModule } from "@nestjs/axios";
import { UserModule } from "../user/user.module";
import { CourseModule } from "../course/course.module";
import { UserCourseModule } from "../user-course/user-course.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    AuthModule,
    HttpModule,
    UserModule,
    CourseModule,
    UserCourseModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
