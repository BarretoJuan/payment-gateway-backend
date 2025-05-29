import { forwardRef, Module } from "@nestjs/common";
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
    forwardRef(() => UserModule),
    forwardRef(() => CourseModule),
    forwardRef(() => UserCourseModule),
    AuthModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
