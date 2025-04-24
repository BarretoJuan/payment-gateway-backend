import { Injectable } from "@nestjs/common";
import { SaveUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Equal, FindOneOptions, Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: SaveUserDto) {
    const create = await this.usersRepository.save(createUserDto);
    return create;
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOneByIdentification(identification: string) {
    return await this.usersRepository.findOne({
      where: { identificationNumber: Equal(identification) },
    });
  }

  async findOne(findOneOptions: FindOneOptions<User>) {
    return await this.usersRepository.findOne(findOneOptions);
  }

  async update(id: string, updateUserDto: DeepPartial<User>) {
    return await this.usersRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
