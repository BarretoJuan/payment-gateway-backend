import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { CreateUserCourseDto } from "./dto/create-user-course.dto";
import { UpdateUserCourseDto } from "./dto/update-user-course.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserCourse } from "./entities/user-course.entity";
import { DeepPartial, Equal, FindOneOptions, In, Repository } from "typeorm";
import { CourseService } from "../course/course.service";
import { UserService } from "../user/user.service";
const jwt = require("jsonwebtoken");
import * as dotenv from "dotenv";
import { Cron } from "@nestjs/schedule";
import { TransactionService } from "../transaction/transaction.service";
dotenv.config();

@Injectable()
export class UserCourseService {
  constructor(
    @InjectRepository(UserCourse)
    private userCoursesRepository: Repository<UserCourse>,
    private readonly usersService: UserService,
    @Inject(forwardRef(() => CourseService))
    private readonly coursesService: CourseService,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionsService: TransactionService, // Assuming transactionsService is part of CourseService
  ) { }

  async userCourseJson() {
    const userCourses = await this.userCoursesRepository.find({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        status: true,
        cancellationReason: true,
        user: {
          id: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          email: true,
          identificationNumber: true,
          firstName: true,
          lastName: true,
          balance: true,
          role: true,
        },
        course: {
          id: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          price: true,
          name: true,
          description: true,
          image: true,
        },
      },
      relations: ["user", "course"],
      where: { status: "cancelled" },
      order: { createdAt: "DESC" },

    })
    return userCourses;
  };

   async userCourseJsonActive() {
    const userCourses = await this.userCoursesRepository.find({
      select: {
        course: {
          id: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          price: true,
          name: true,
          description: true,
          image: true,
        },
      },
      relations: ["course"],
      where: { status: "acquired" },
      order: { createdAt: "DESC" },

    })
    return userCourses;
  };

  // This will return the latest cancelled user-course per cancelled course, it wouldn't be a problem because client will never consume user-course but its status which will the same whatever course is retrieved
  async findCancelledCourses() {
    const userCourses = await this.userCoursesRepository
    .createQueryBuilder("user_course")
    .innerJoinAndSelect("user_course.course", "course") 
    .where("user_course.status = :status", { status: "cancelled" }) 
    .distinctOn(["course.id"])
    .select([
      "user_course.id",
      "user_course.status",
      "user_course.cancellationReason",
      "course.id",
      "course.createdAt",
      "course.updatedAt",
      "course.deletedAt",
      "course.price",
      "course.name",
      "course.description",
      "course.image",
    ])
    .orderBy("course.id", "ASC")
    .addOrderBy("user_course.createdAt", "DESC")
      .getMany()

    return userCourses;
  }

  async create(createUserCourseDto: CreateUserCourseDto) {
    const user = await this.usersService.findOne({
      where: { id: Equal(createUserCourseDto.userId) },
    });
    const course = await this.coursesService.findOne({
      where: { id: Equal(createUserCourseDto.courseId) },
    });
    const userCourse = new UserCourse();

    if (!user || !course) {
      return "User or course not found";
    }
    userCourse.course = course;
    userCourse.user = user;
    userCourse.status = "not_acquired";

    const token = jwt.sign(
      { userId: user.id, courseId: course.id },
      process.env.GATEWAY_SECRET_KEY,
    );

    userCourse.token = token;
    await this.userCoursesRepository.save(userCourse);

    return { message: "This action adds a new userCourse", token };
  }

  async findUserCourses(
    userId: string,
    status:
      | "acquired"
      | "not_acquired"
      | "cancelled"
      | "expired"
      | "not_bought",
  ) {
    // await this.transactionsService.cancelExpiredTransactionsByUser(userId);
    if (status === "not_bought") {
      const allCourses = await this.coursesService.findAll();
      const userCourses = await this.userCoursesRepository.find({
        relations: ["course"],
        where: { user: Equal(userId) },
      });

      const userCourseIds = userCourses.map((uc) => uc.course.id);
      const notBoughtCourses = allCourses.filter(
        (course) => !userCourseIds.includes(course.id),
      );

      const transactableUserCourses = await this.userCoursesRepository.find({
        relations: ["course"],
        where: {
          user: Equal(userId),
          status: Equal("transactable"),
        },
      });

      // Add course relations from transactableUserCourses to notBoughtCourses
      const transactableCourses = transactableUserCourses.map((uc) => uc.course);

      return [...notBoughtCourses, ...transactableCourses];
    }
    if (status !== null) {
      const userCourses = await this.userCoursesRepository.find({
        relations: ["user", "course"],
        where: {
          user: Equal(userId),
          status: status,
        },
      });
      return userCourses;
    }
    return [];
  }

  async decodeGatewayToken(token: string) {
    console.log("wtfff" + typeof token);
    console.log("2wtfff" + typeof process.env.GATEWAY_SECRET_KEY);
    if (typeof token !== "string") {
      throw new Error("Token must be a string");
    }
    const decoded = jwt.verify(token, process.env.GATEWAY_SECRET_KEY);
    const user = await this.usersService.findOne({
      where: { id: Equal(decoded.userId) },
    });
    const course = await this.coursesService.findOne({
      where: { id: Equal(decoded.courseId) },
    });
    const response = { decoded, user, course };
    return response;
  }

  async findAll() {
    return await this.userCoursesRepository.find({
      relations: ["user", "course"],
      where: { status: "cancelled" }, //auditing purposes
    });
  }

  async find(findOptions: FindOneOptions<UserCourse>) {
    return await this.userCoursesRepository.find(findOptions);
  }

  async findOne(findOneOptions: FindOneOptions<UserCourse>) {
    return await this.userCoursesRepository.findOne(findOneOptions);
  }

  update(id: string, updateUserCourseDto: DeepPartial<UserCourse>) {
    return this.userCoursesRepository.update(id, updateUserCourseDto);
  }

  remove(id: number) {
    return `This action removes a #${id} userCourse`;
  }

  @Cron("0 0 * * *")
  async expireUserCourses() {
    const currentDate = new Date();
    console.log("Current date: ", currentDate);
    const courses = await this.coursesService.findAllInstallments();

    const userCourses = await this.userCoursesRepository.find({
      relations: ["user", "course"],
      where: { course: In(courses.map((course) => course.id)) },
    });

    let coursePrices: { courseId: string; coursePrice: number }[] = [];
    for (const course of courses) {
      let coursePrice = 0;
      if (course.installments) {
        for (const installment of course.installments) {
          if (new Date(installment.date) > currentDate) {
            continue;
          }
          coursePrice +=
            (installment.percentage * (course.price ? +course.price : 0)) / 100;
        }
      }
      coursePrices.push({ courseId: course.id, coursePrice: coursePrice });
    }

    for (const userCourse of userCourses) {
      const coursePrice = coursePrices.find(
        (course) => course.courseId === userCourse.course.id,
      );
      if (coursePrice && +coursePrice.coursePrice > +userCourse.balance) {
        userCourse.status = "expired";
        this.userCoursesRepository.update(userCourse.id, userCourse);
      }
    }
  }
}
