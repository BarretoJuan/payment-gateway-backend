import { PartialType } from "@nestjs/mapped-types";
import { CreateInstallmentDto } from "./create-installment.dto";
import { IsOptional } from "class-validator";

export class UpdateInstallmentDto extends PartialType(CreateInstallmentDto) {
  @IsOptional()
  courseId?: string;

  @IsOptional()
  date?: Date;

  @IsOptional()
  percentage?: number;
}
