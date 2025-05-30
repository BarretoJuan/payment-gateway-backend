import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from "@nestjs/common";
import { CompanyService } from "./company.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Controller("company")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  findAll() {
    return this.companyService.findFirst();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.companyService.findOne(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Put("update")
  async updateCompany(@Body() updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companyService.findFirst();

    if (!company) {
      throw new Error("Company not found");
    }
    return this.companyService.update(company.id, updateCompanyDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.companyService.remove(id);
  }
}
