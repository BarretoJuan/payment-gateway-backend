import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { SaveUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Equal, FindOneOptions, Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
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

  
  async updateUser(id: string, updateUserDto: {firstName: string, lastName:string, role: "admin" | "accounting" | "user" | null, password: string, identificationNumber: string, balance: string}) {
   const user = await this.usersRepository.findOne({
      where: { id: Equal(id) },
    });
    if (!user) {
      throw new Error("User not found");
    }
    {}
    if(updateUserDto.password) {
      await this.authService.updatePassword(user, updateUserDto.password);
    }
     const { password, ...userToUpdate } = updateUserDto;
     await this.usersRepository.update(id, userToUpdate);
      return updateUserDto;

  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
