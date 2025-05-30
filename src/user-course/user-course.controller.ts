import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { UserCourseService } from "./user-course.service";
import { CreateUserCourseDto } from "./dto/create-user-course.dto";
import { UpdateUserCourseDto } from "./dto/update-user-course.dto";
import { AuthGuard } from "../auth/auth.guard";
import { DeepPartial, Equal } from "typeorm";
import { UserCourse } from "./entities/user-course.entity";

@Controller("user-course")
export class UserCourseController {
  constructor(private readonly userCourseService: UserCourseService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createUserCourseDto: CreateUserCourseDto) {
    return this.userCourseService.create(createUserCourseDto);
  }
  @Get("user-course-json")
  userCourseJson() {
    console.log("Fetching user course JSON");
    try {
      return this.userCourseService.userCourseJson();
    }
    catch (error) {
      console.error("Error fetching user course JSON:", error);
      return [];
  }
}


  @Post("decode")
  decodeGatewayToken(@Body() token: { token: string }) {
    console.log("token", token);
    return this.userCourseService.decodeGatewayToken(token.token);
  }

  @Post("get-user-courses-by-status")
  @UseGuards(AuthGuard)
  findUserCoursesByStatus(
    @Body()
    body: {
      userId: string;
      status:
        | "acquired"
        | "not_acquired"
        | "cancelled"
        | "expired"
        | "not_bought";
    },
  ) {
    return this.userCourseService.findUserCourses(body.userId, body.status);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.userCourseService.findAll();
  }

  @Get("test-cron")
  test() {
    return this.userCourseService.expireUserCourses();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  findOne(@Param("id") id: string) {
    return this.userCourseService.findOne({ where: { id: Equal(id) } });
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  update(
    @Param("id") id: string,
    @Body() updateUserCourseDto: DeepPartial<UserCourse>,
  ) {
    return this.userCourseService.update(id, updateUserCourseDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  remove(@Param("id") id: string) {
    return this.userCourseService.remove(+id);
  }
}
