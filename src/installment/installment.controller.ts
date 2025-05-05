import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { InstallmentService } from "./installment.service";
import { CreateInstallmentDto } from "./dto/create-installment.dto";
import { UpdateInstallmentDto } from "./dto/update-installment.dto";

@Controller("installment")
export class InstallmentController {
  constructor(private readonly installmentService: InstallmentService) {}

  @Post()
  create(@Body() createInstallmentDto: CreateInstallmentDto) {
    return this.installmentService.create(createInstallmentDto);
  }

  @Get()
  findAll(@Query("courseId") courseId?: string) {
    if (courseId) {
      return this.installmentService.findByCourse(courseId);
    }
    return this.installmentService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.installmentService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateInstallmentDto: UpdateInstallmentDto,
  ) {
    return this.installmentService.update(id, updateInstallmentDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.installmentService.remove(id);
  }

  @Get("validate/:courseId")
  validateInstallments(@Param("courseId") courseId: string) {
    return this.installmentService.validateInstallments(courseId);
  }
}
