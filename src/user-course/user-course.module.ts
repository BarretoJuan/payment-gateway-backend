import { Module } from '@nestjs/common';
import { UserCourseService } from './user-course.service';
import { UserCourseController } from './user-course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCourse } from './entities/user-course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserCourse])],
  controllers: [UserCourseController],
  providers: [UserCourseService],
})
export class UserCourseModule {}
