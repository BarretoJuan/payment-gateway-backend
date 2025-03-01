/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsNotEmpty, IsEmail, length, MinLength, Min } from "class-validator";
import { userRoles } from "src/common/constants";
import { Long } from "typeorm";

export class SaveUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  identificationNumber: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  role: userRoles;
}

export class CreateUserDto extends SaveUserDto {
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
