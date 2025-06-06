import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Put,
} from "@nestjs/common";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { AuthGuard } from "../auth/auth.guard";
import { DeepPartial, Equal } from "typeorm";
import { Courses } from "./entities/course.entity";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("course")
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCourseDto: DeepPartial<Courses>) {
    console.log("pipiipip", createCourseDto)
    return this.courseService.create(createCourseDto);
  }

  @Get("active-courses")
  activeCourses() {
    return this.courseService.activeCourses();
  }

  @Get("user-and-courses")
  userAndCourses() {
    return this.courseService.coursesAndUsers();
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.courseService.findAll();
  }

  @Get("all-courses")
  async allCourse() {
    return await this.courseService.findAllCourses();
  }

  @Put("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const response = await this.courseService.uploadFile(file);
    console.log("upload file controller", response);
    return response;
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  findOne(@Param("id") id: string) {
    return this.courseService.findOne({ where: { id: Equal(id) } });
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  update(@Param("id") id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  remove(@Param("id") id: string, body: {cancellationReason?: string}) {
    return this.courseService.remove(id, body?.cancellationReason);
  }
}
