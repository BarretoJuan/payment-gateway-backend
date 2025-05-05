import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { Installment } from "../entities/installment.entity";

export class CreateInstallmentDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  courseId: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  percentage: number;
}
