import { Injectable } from '@nestjs/common';
import { CreateUserDto, SaveUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: SaveUserDto) {
    console.log("??? ", createUserDto);
    const create = await this.usersRepository.save(createUserDto);
    console.log("create", create);
    return create;
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOneByIdentification(identification: string) {
    console.log("identificationnn", identification);
    return await this.usersRepository.findOne({ where: {identificationNumber: Equal(identification)} });
  }

  findOne(findOneOptions: FindOneOptions<User>) {
    return this.usersRepository.findOne(findOneOptions);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
