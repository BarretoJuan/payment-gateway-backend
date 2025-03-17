import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { UpdateInstallmentDto } from './dto/update-installment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Installment } from './entities/installment.entity';
import { DeepPartial, Equal, Repository } from 'typeorm';
import { Courses } from '../course/entities/course.entity';

@Injectable()
export class InstallmentService {
  constructor(
    @InjectRepository(Installment)
    private installmentRepository: Repository<Installment>,
    @InjectRepository(Courses)
    private coursesRepository: Repository<Courses>,
  ) {}

  async create(createInstallmentDto: DeepPartial<Installment>): Promise<Installment> {
    // Check if course exists
    if(!createInstallmentDto.courseId || !createInstallmentDto.date || !createInstallmentDto.percentage) {
      throw new Error('Missing parameters for a installment insertion');
    }
    const course = await this.coursesRepository.findOne({ 
      where: { id: Equal(createInstallmentDto.courseId) } 
    });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${createInstallmentDto.courseId} not found`);
    }

    // Check if course has installment payment scheme
    if (course.paymentScheme !== 'installments') {
      throw new Error(`Course with ID ${createInstallmentDto.courseId} does not support installment payments`);
    }

    // Create new installment
    const installment = new Installment();
    installment.date = new Date(createInstallmentDto.date as string); // Format as YYYY-MM-DD
    installment.percentage = createInstallmentDto.percentage;
    installment.course = course;

    return this.installmentRepository.save(installment);
  }

  async findAll(): Promise<Installment[]> {
    return this.installmentRepository.find({
      relations: ['course'],
    });
  }

  async findOne(id: string): Promise<Installment> {
    const installment = await this.installmentRepository.findOne({
      where: { id: Equal(id) },
      relations: ['course'],
    });

    if (!installment) {
      throw new NotFoundException(`Installment with ID ${id} not found`);
    }

    return installment;
  }

  async update(id: string, updateInstallmentDto: UpdateInstallmentDto): Promise<Installment> {
    const installment = await this.findOne(id);

    // Update fields if provided
    if (updateInstallmentDto.date) {
      installment.date = new Date(updateInstallmentDto.date);  // Format as YYYY-MM-DD
    }

    if (updateInstallmentDto.percentage) {
      installment.percentage = updateInstallmentDto.percentage;
    }

    // If courseId is provided, update course relation
    if (updateInstallmentDto.courseId) {
      const course = await this.coursesRepository.findOne({
        where: { id: Equal(updateInstallmentDto.courseId) }
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${updateInstallmentDto.courseId} not found`);
      }

      if (course.paymentScheme !== 'installments') {
        throw new Error(`Course with ID ${updateInstallmentDto.courseId} does not support installment payments`);
      }

      installment.course = course;
    }

    installment.updatedAt = new Date();
    await this.installmentRepository.update(installment.id, installment);
    return this.findOne(installment.id);
  }

  async remove(id: string): Promise<void> {
    const installment = await this.findOne(id);
    installment.deletedAt = new Date();
    await this.installmentRepository.update(id, installment);
  }

  async findByCourse(courseId: string): Promise<Installment[]> {
    const course = await this.coursesRepository.findOne({
      where: { id: Equal(courseId) }
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return this.installmentRepository.find({
      where: { course: { id: Equal(courseId) } },
      order: { date: 'ASC' }
    });
  }

  async validateInstallments(courseId: string): Promise<boolean> {
    const installments = await this.findByCourse(courseId);
    
    // Check if installments exist
    if (installments.length === 0) {
      return false;
    }
    
    // Check if total percentage equals 100%
    const totalPercentage = installments.reduce((sum, installment) => sum + installment.percentage, 0);
    return totalPercentage === 100;
  }
}
