/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/auth/auth.service.ts
import { forwardRef, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Equal } from "typeorm";
import { SupabaseService } from "../supabase/supabase.service";
import { User } from "../user/entities/user.entity";
import { CreateUserDto, SaveUserDto } from "../user/dto/create-user.dto";
import { UserService } from "../user/user.service";
import { userRoles } from "../common/constants";
import { CompanyService } from "../company/company.service";
import { CreateCompanyDto } from "../company/dto/create-company.dto";
import { UpdateUserDto } from "../user/dto/update-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,
    private readonly companyService: CompanyService,
  ) {}

  /**
   * Sign up a new user with email and password
   */
  async signUp(user: CreateUserDto) {
    user = { ...user, role: userRoles.USER }; // this should work as long as this endpoint is not used by another role, if this is wanted to be changed, then we should cast the user roles that comes from the frontend which in essence is the same but in uppercase
    const email = user.email;
    const password = user.password;
    const idExists = await this.usersService.findOne({
      where: { identificationNumber: Equal(user.identificationNumber) },
    });
    const emailExists = await this.usersService.findOne({
      where: { email: Equal(user.email) },
    });
    if (user.role.toLocaleLowerCase() !== "user") {
      console.log("user role is not user", user.role);
      throw new UnauthorizedException("Not allowed");
    }
    if (idExists || emailExists) {
      console.log("id or email already exists", idExists, emailExists);
      throw new UnauthorizedException("La cédula o el correo ya existe");
    }
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signUp({ email, password });
    console.log("data", data, error);
    if (error) {
      throw new Error(error.message);
    }

    const { password: userPassword, ...userToSave } = user;
    await this.usersService.create(userToSave);

    return {
      user: userToSave,
      accessToken: data?.session?.access_token,
    };
  }

  /**
   * TODO: SAME BEHAVIOR AS signIn METHOD
   */
  async signUpAdmin(user: CreateUserDto) {
    const email = user.email;
    const password = user.password;
    const idExists = await this.usersService.findOne({
      where: { identificationNumber: Equal(user.identificationNumber) },
    });
    const emailExists = await this.usersService.findOne({
      where: { email: Equal(user.email) },
    });

    this.supabaseService;
    if (idExists || emailExists) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signUp({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    const { password: userPassword, ...userToSave } = user;
    await this.usersService.create({
      ...userToSave,
      role: userRoles.ADMIN,
    });

    return {
      user: {
        ...userToSave,
        role: user.role.toLocaleLowerCase(),
      },
      accessToken: data?.session?.access_token,
    };
  }

  async signUpOperator({
    id,
    role,
  }: {
    id: string;
    role: UpdateUserDto["role"];
  }) {
    if (!role) {
      throw new UnauthorizedException("Role is required");
    }
    console.log("llegue aqui");
    return await this.usersService.update(id, { role });
  }

  /**
   * Sign in a user with email and password

   */
  async signIn(identification: string, password: string) {
    console.log(identification, password);
    const user =
      await this.usersService.findOneByIdentification(identification);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email: user.email, password });

    if (error) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // // Save session to database
    // const session = new Session();
    // session.userId = data.user.id;
    // session.accessToken = data.session.access_token;
    // session.refreshToken = data.session.refresh_token;
    // await this.sessionRepository.save(session);

    return {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
        id: user.id,
        balance : user.balance,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  /**
   * Refresh a user's session using the refresh token
   * TODO: CHECK THIS BEHAVIOR
   */
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException(
        "Invalid Refresh Token: Refresh Token Not Found",
      );
    }
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.refreshSession({ refresh_token: refreshToken });

    if (error) {
      throw new Error(error.message);
    }

    const response = {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      expiresIn: data.session?.expires_in,
      expiresAt: data.session?.expires_at,
      tokenType: data.session?.token_type,
    };
    return response;
  }

  /**
   * Log out a user by invalidating their session
   */
  async logout(accessToken: string) {
    const { error } = await this.supabaseService.getClient().auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    // // Delete session from database
    // await this.sessionRepository.delete({ accessToken });

    return { message: "Logged out successfully" };
  }

  /**
   * Validate a user's access token
   */
  async validateUser(accessToken: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(accessToken);

    const userDb = data.user?.email
      ? await this.usersService.findOne({
          where: { email: Equal(data.user.email) },
        })
      : null;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data.user,
      user: userDb,
    };
  }

  /**
   * Check if this is the first run of the application by retrieving a count of users in the database:  If there are no users, then it is the first run
   */
  async checkFirstRun() {
    const numberOfUsers = (await this.usersService.findAll()).length;

    // Negate the boolean value of numberOfUsers to return true if there are no users in the database and false if there are users.

    return {
      isFirstRun: !numberOfUsers,
    };
  }

  async createCompany({
    name,
    address,
    email,
    telephone_number,
    description,
  }: CreateCompanyDto) {
    const { isFirstRun } = await this.checkFirstRun();

    if (!isFirstRun) {
      throw new UnauthorizedException("Company already created");
    }
    const company = await this.companyService.create({
      name,
      address,
      email,
      telephone_number,
      description,
    });

    return company;
  }

  async signUpAdminFirstRun(user: CreateUserDto) {
    const { isFirstRun } = await this.checkFirstRun();
    if (!isFirstRun) {
      throw new UnauthorizedException("root admin already created");
    }
    return this.signUpAdmin(user);
  }

  async getCompany() {
    const companies = await this.companyService.findAll();
    const company = companies.length > 0 ? companies[0] : null;

    return company;
  }

async updatePassword(user: User, newPassword: string) {
  const email = user.email;

  // First, get the user ID from the email
   // List all users and filter manually
  const { data: userList, error: userError } = await this.supabaseService
    .getClient()
    .auth.admin.listUsers();

  if (userError) {
    throw new Error(userError.message);
  }

  const userData = userList.users.find(u => u.email === email);
  
  if (!userData) {
    throw new Error('User not found');
  }

  const userId = userData.id;

  //update the password in the database
  const { data, error } = await this.supabaseService
    .getClient()
    .auth.admin.updateUserById(userId, { password: newPassword });

  if (error) {
    throw new Error(error.message);
  }

  return { message: "Password updated successfully", data };
}

async updateEmail(user: User, newEmail: string) {
  const email = user.email;

  const userExists = await this.usersService.findOne({
    where: { email: Equal(newEmail) },
  });
  if (userExists) {
    return false
  }

  // First, get the user ID from the email
  // List all users and filter manually
  const { data: userList, error: userError } = await this.supabaseService
    .getClient()
    .auth.admin.listUsers();

  if (userError) {
   return false
  }

  const userData = userList.users.find(u => u.email === email);
  
  if (!userData) {
    return false
  }

  const userId = userData.id;

  //update the email in the database
  const { data, error } = await this.supabaseService
    .getClient()
    .auth.admin.updateUserById(userId, { email: newEmail });

  if (error) {
   return false
  }

  console.log( { message: "Email updated successfully", data });
  return true;
}
}
