import { Module } from "@nestjs/common";
import { CourseService } from "./course.service";
import { CourseController } from "./course.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Courses } from "./entities/course.entity";
import { AuthModule } from "../auth/auth.module";
import { InstallmentModule } from "../installment/installment.module";

@Module({
  imports: [TypeOrmModule.forFeature([Courses]), AuthModule, InstallmentModule],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
