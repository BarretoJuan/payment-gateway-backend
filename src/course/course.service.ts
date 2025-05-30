import { Injectable } from "@nestjs/common";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Courses } from "./entities/course.entity";
import { DeepPartial, Equal, FindOneOptions, Not, Repository } from "typeorm";
import { InstallmentService } from "../installment/installment.service";
import { SupabaseService } from "../supabase/supabase.service";
import { UserService } from "../user/user.service";
import { UserCourseService } from "../user-course/user-course.service";

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Courses)
    private coursesRepository: Repository<Courses>,
    private readonly installmentService: InstallmentService,
    private readonly supabaseService: SupabaseService,
    private readonly userCoursesService: UserCourseService,
    private readonly userService: UserService

  ) {}

  async findAllCourses() {
    return await this.coursesRepository.find({
      relations: ["installments"],
    });
  }

  async create(createCourseDto: DeepPartial<Courses>) {
    const course = await this.coursesRepository.save(createCourseDto);

    if (createCourseDto.paymentScheme === "installments") {
      if (!createCourseDto.installments) {
        throw new Error(
          "Course with installment payment scheme must have installments",
        );
      }
      const installments = createCourseDto.installments;
      let totalPercentage = 0;
      let previousDate;
      for (const installment of installments) {
        if (!installment.percentage || !installment.date) {
          throw new Error("Installment percentage is undefined");
        }
        totalPercentage = totalPercentage + installment.percentage;
        if (previousDate && installment.date <= previousDate) {
          throw new Error(
            "Installments should be inserted in chronological order",
          );
        }
        previousDate = installment.date;
      }

      if (totalPercentage != 100) {
        throw new Error("Installments percentages should sum to 100%");
      }

      for (const installment of installments) {
        installment.courseId = course.id;
        await this.installmentService.create(installment);
      }
    }

    return course;
  }

  async findAll() {
    return await this.coursesRepository.find({ relations: ["installments"] });
  }

  async findAllInstallments() {
    return await this.coursesRepository.find({
      where: { paymentScheme: "installments" },
      relations: ["installments"],
    });
  }

  async findOne(findOneOptions: FindOneOptions<Courses>) {
    return await this.coursesRepository.findOne(findOneOptions);
  }

  async update(id: string, updateCourseDto: DeepPartial<Courses>) {
    return await this.coursesRepository.update(id, updateCourseDto);
  }

  async remove(id: string, cancellationReason?: string) {
    const course = await this.coursesRepository.findOne({ where: { id } });
    if (!course) {
      throw new Error("Course not found");
    }
    console.log("course", course)

    const userCourses = await this.userCoursesService.find({where: {course: Equal(course.id), status: Not('cancelled') }, relations: ["user"]});
    console.log("userCourses", userCourses)
    for (const userCourse of userCourses) {

      if (cancellationReason) {
        userCourse.cancellationReason = cancellationReason;
      }
      else {
        userCourse.cancellationReason = "Curso cancelado";}
      
      userCourse.status = "cancelled";
      await this.userCoursesService.update(userCourse.id, userCourse);
      let userBalance = Number(userCourse.user.balance);
      console.log("userBalance", userBalance, "userCourse.balance", +userCourse.balance)
      userCourse!.user!.balance = userCourse.user!.balance ? (userBalance + Number(userCourse.balance)).toString() : "0";
      await this.userService.update(userCourse.user.id, userCourse.user!);
    }
  return await this.coursesRepository.update(id, { deletedAt: new Date() });
}

  async uploadFile(file: Express.Multer.File) {
    console.log("upload File:", file)
    this.supabaseService;
    const { data, error } = await this.supabaseService
      .getClient()
      .storage.from("courses-images")
      .upload(file.originalname, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const imagePath = data;
    console.log("imagePath uploadFile", imagePath);

    const url = this.supabaseService
      .getClient()
      .storage.from("courses-images")
      .getPublicUrl(imagePath.path);
    console.log("url uploadFile", url);
    return { url: url.data.publicUrl };
  }
}
