import { Injectable } from "@nestjs/common";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Courses } from "./entities/course.entity";
import { DeepPartial, FindOneOptions, Repository } from "typeorm";
import { InstallmentService } from "../installment/installment.service";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Courses)
    private coursesRepository: Repository<Courses>,
    private readonly installmentService: InstallmentService,
    private readonly supabaseService: SupabaseService,
  ) {}

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

  async remove(id: string) {
    return await this.coursesRepository.update(id, { deletedAt: Date.now() });
  }

  async uploadFile(file: Express.Multer.File) {
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

    const url = this.supabaseService
      .getClient()
      .storage.from("courses-images")
      .getPublicUrl(imagePath.path);

    return { url: url.data.publicUrl };
  }
}
