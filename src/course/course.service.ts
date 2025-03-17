import { Injectable } from "@nestjs/common";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Courses } from "./entities/course.entity";
import { DeepPartial, FindOneOptions, Repository } from "typeorm";
import { InstallmentService } from "../installment/installment.service";
import { CreateInstallmentDto } from "src/installment/dto/create-installment.dto";

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Courses)
    private coursesRepository: Repository<Courses>,
    private readonly installmentService: InstallmentService,
  ) {}

  async create(createCourseDto: DeepPartial<Courses>) {

    const course = await this.coursesRepository.save(createCourseDto);

    if (createCourseDto.paymentScheme === 'installments' ) {
      if ( !createCourseDto.installments) { throw new Error('Course with installment payment scheme must have installments'); }
      const installments = createCourseDto.installments
      let totalPercentage = 0;
      let previousDate;
      for (const installment of installments) {
        if (!installment.percentage || !installment.date ) {
          throw new Error('Installment percentage is undefined');
        }
        totalPercentage = totalPercentage + installment.percentage;
        if (previousDate && (installment.date <= previousDate)) {
          throw new Error("Installments should be inserted in chronological order");
        }
        previousDate = installment.date
      }

      if (totalPercentage != 100) {
        throw new Error('Installments percentages should sum to 100%')
      }

      for ( const installment of installments) {
        installment.courseId = course.id;
        await this.installmentService.create(installment);
      }

    }
    
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
