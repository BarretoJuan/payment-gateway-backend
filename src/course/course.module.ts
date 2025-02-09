import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courses } from './entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Courses])],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
