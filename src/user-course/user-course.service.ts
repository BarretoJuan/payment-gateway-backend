import { Injectable } from '@nestjs/common';
import { CreateUserCourseDto } from './dto/create-user-course.dto';
import { UpdateUserCourseDto } from './dto/update-user-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCourse } from './entities/user-course.entity';
import { Equal, Repository } from 'typeorm';
import { CourseService } from '../course/course.service';
import { UserService } from '../user/user.service';
const jwt = require('jsonwebtoken');
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class UserCourseService {
  constructor(
    @InjectRepository(UserCourse)
    private userCoursesRepository: Repository<UserCourse>,
    private readonly usersService: UserService,
    private readonly coursesService: CourseService,
  ) {}

  async create(createUserCourseDto: CreateUserCourseDto) {


    const user = await this.usersService.findOne({where: {id: Equal(createUserCourseDto.userId)}});
    const course = await this.coursesService.findOne({where: {id: Equal(createUserCourseDto.courseId)}});
    const userCourse = new UserCourse();

    if (!user || !course) {
      return 'User or course not found';
    }
    userCourse.course = course;
    userCourse.user = user;
    userCourse.status = 'not_acquired';

  
    const token = jwt.sign(
      { userId: user.id, courseId: course.id },
      process.env.GATEWAY_SECRET_KEY
    );

    userCourse.token = token;
    await this.userCoursesRepository.save(userCourse);

    return { message: 'This action adds a new userCourse', token };
  }

  async decodeGatewayToken(token: string) {
    console.log("wtfff" + typeof token);
    console.log("2wtfff" + typeof process.env.GATEWAY_SECRET_KEY);
    if (typeof token !== 'string') {
      throw new Error('Token must be a string');
    }
    const decoded = jwt.verify(token, process.env.GATEWAY_SECRET_KEY);
    const user = await this.usersService.findOne({where: {id: Equal(decoded.userId)}});
    const course = await this.coursesService.findOne({where: {id: Equal(decoded.courseId)}});
    const response = {decoded, user, course};
    return response;
  }

  async findAll() {
    return await this.userCoursesRepository.find({
      relations: ['user', 'course'], where: { status: 'cancelled'} //auditing purposes
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} userCourse`;
  }

  update(id: number, updateUserCourseDto: UpdateUserCourseDto) {
    return `This action updates a #${id} userCourse`;
  }

  remove(id: number) {
    return `This action removes a #${id} userCourse`;
  }
}
