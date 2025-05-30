import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Company } from "./entities/company.entity";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}


  async findFirst() {
    return this.companyRepository.findOne({

    });
  }
  create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.save(createCompanyDto);
    return company;
  }

  findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  findOne(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company | null> {

    if (!updateCompanyDto) {
      throw new Error("Update data is required");
    }
    await this.companyRepository.update(id, updateCompanyDto);
    return this.companyRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.companyRepository.delete(id);
  }
}
