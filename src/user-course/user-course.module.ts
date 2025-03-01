import { Module } from "@nestjs/common";
import { UserCourseService } from "./user-course.service";
import { UserCourseController } from "./user-course.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserCourse } from "./entities/user-course.entity";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { CourseModule } from "../course/course.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCourse]),
    AuthModule,
    UserModule,
    CourseModule,
  ],
  controllers: [UserCourseController],
  providers: [UserCourseService],
  exports: [UserCourseService],
})
export class UserCourseModule {}
