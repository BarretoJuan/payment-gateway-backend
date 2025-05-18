import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { FindOneOptions } from "typeorm";
import { AuthGuard } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  findOne(@Body() options: FindOneOptions) {
    return this.userService.findOne(options);
  }

  @Patch("/update/:id")
  @UseGuards(AuthGuard)

  async updateUser(@Param("id") id: string, @Req() request: Request, @Body() updateUserDto: {firstName: string, lastName:string, role: "admin" | "accounting" | "user" | null, password: string, identificationNumber: string, balance: string}) {
    
        const accessToken: string = request.headers["authorization"]?.split(" ")[1];
        const decodedToken = await this.authService.validateUser(accessToken);

        if (updateUserDto.identificationNumber) {
          const user = await this.userService.findOne({
            where: { identificationNumber: updateUserDto.identificationNumber },
          });
          if (user) {
            throw new UnauthorizedException("Identification number already exists");
          }

        }
    
        if ((updateUserDto.role || updateUserDto.balance || updateUserDto.identificationNumber) && decodedToken.user?.role?.toLocaleLowerCase() !== "admin" ) {
          throw new UnauthorizedException(
            "You are not authorized to perform this action",
          );}

    return this.userService.updateUser(id, updateUserDto);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log("wtf xd")
    return this.userService.update(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
