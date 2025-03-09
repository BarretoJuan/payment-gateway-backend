import { Injectable } from "@nestjs/common";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Courses } from "./entities/course.entity";
import { DeepPartial, FindOneOptions, Repository } from "typeorm";

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Courses)
    private coursesRepository: Repository<Courses>,
  ) {}

  create(createCourseDto: DeepPartial<Courses>) {
    const course = this.coursesRepository.save(createCourseDto);
    return course;
  }

  async findAll() {
    return await this.coursesRepository.find();
  }

  async findOne(findOneOptions: FindOneOptions<Courses>) {
    return await this.coursesRepository.findOne(findOneOptions);
  }

  async update(id: string, updateCourseDto: DeepPartial<Courses>) {
    return await this.coursesRepository.update(id, updateCourseDto);
  }

  async remove(id: string) {
    return await this.coursesRepository.update(id, { deletedAt: Date.now() });
  }
}
