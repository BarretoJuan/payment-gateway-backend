import { Module } from "@nestjs/common";
import { InstallmentService } from "./installment.service";
import { InstallmentController } from "./installment.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Installment } from "./entities/installment.entity";
import { Courses } from "../course/entities/course.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Installment, Courses])],
  controllers: [InstallmentController],
  providers: [InstallmentService],
  exports: [InstallmentService],
})
export class InstallmentModule {}
