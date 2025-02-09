// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { SupabaseService } from '../supabase/supabase.service';
import { User } from '../user/entities/user.entity'; 
import { CreateUserDto } from '../user/dto/create-user.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) {}

  /**
   * Sign up a new user with email and password
   */
  async signUp(user: CreateUserDto) {
    const email = user.email;
    const password = user.password;
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signUp({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    const { password: userPassword, ...userToSave} = user;
    console.log("userToSave", userToSave);
    await this.userRepository.save(userToSave);

    return data;
  }

  /**
   * Sign in a user with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    // // Save session to database
    // const session = new Session();
    // session.userId = data.user.id;
    // session.accessToken = data.session.access_token;
    // session.refreshToken = data.session.refresh_token;
    // await this.sessionRepository.save(session);

    return data;
  }

  /**
   * Refresh a user's session using the refresh token
   */
  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.refreshSession({ refresh_token: refreshToken });

    if (error) {
      throw new Error(error.message);
    }

    // // Update session in database
    // const session = await this.sessionRepository.findOne({
    //   where: { refreshToken },
    // });
    // if (session) {
    //   session.accessToken = data.session?.access_token;
    //   session.refreshToken = data.session?.refresh_token;
    //   await this.sessionRepository.save(session);
    // }

    return data;
  }

  /**
   * Log out a user by invalidating their session
   */
  async logout(accessToken: string) {
    const { error } = await this.supabaseService
      .getClient()
      .auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    // // Delete session from database
    // await this.sessionRepository.delete({ accessToken });

    return { message: 'Logged out successfully' };
  }

  /**
   * Validate a user's access token
   */
  async validateUser(accessToken: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(accessToken);

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  }
}