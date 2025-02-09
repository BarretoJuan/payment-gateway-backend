import { Injectable } from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from './entities/operator.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OperatorService {
    constructor(
      @InjectRepository(Operator)
      private operatorsRepository: Repository<Operator>,
    ) {}
    
  create(createOperatorDto: CreateOperatorDto) {
    return 'This action adds a new operator';
  }

  async findAll() {
    return await this.operatorsRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} operator`;
  }

  update(id: number, updateOperatorDto: UpdateOperatorDto) {
    return `This action updates a #${id} operator`;
  }

  remove(id: number) {
    return `This action removes a #${id} operator`;
  }
}
