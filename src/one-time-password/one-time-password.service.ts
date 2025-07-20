import { Injectable } from '@nestjs/common';
import { CreateOneTimePasswordDto } from './dto/create-one-time-password.dto';
import { UpdateOneTimePasswordDto } from './dto/update-one-time-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OneTimePassword } from './entities/one-time-password.entity';
import { Equal, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OneTimePasswordService  {

  constructor(
    @InjectRepository(OneTimePassword)
    private oneTimePasswordRepository: Repository<OneTimePassword>,
    private readonly mailerService: MailerService,
    private readonly authService: AuthService,
  ) {}

  async generateOTP(user: User) {

    const OTP = await this.oneTimePasswordRepository.findOne({
      where: { user: { id: user.id }, used: false }, order: { createdAt: 'DESC' }
    });

    let otpCode: number | undefined = OTP?.code;
    if (!otpCode) {
      otpCode =  Math.floor(Math.random() * (999999 - 100000) + 100000);
      await this.oneTimePasswordRepository.save({user, code: otpCode}) // Generate a 6-digit OTP
    }

    
    // Send OTP via email
    await this.sendOtpEmail(user.email, otpCode);

    return {
      code: "success",
      userId: user.id,
      email: user.email,
      OTPcreatedAt: OTP?.createdAt || new Date(),
    };

  }

  async validateOTP(user: User, code: number, password: string) {
    console.log("VALIDATE OTP: ", user, code, password);
    const otp = await this.oneTimePasswordRepository.findOne({
      where: { user: { id: Equal(user.id) }, code: Equal(code), used: false },
      order: { createdAt: 'DESC' },
    });

    console.log("OTP VALIDATION: ", otp);

    if (!otp) {
      console.log("OTP not found or already used");
      return false; // OTP not found or already used
    }

    otp.used = true; // Mark OTP as used
    await this.oneTimePasswordRepository.save(otp);

    const updatePassword = await this.authService.updatePassword(user, password);
    console.log("PASSWORD UPDATE: ", updatePassword);

    return true; // Return the validated OTP
  }

  private async sendOtpEmail(email: string, otpCode: number) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    to: email,
    subject: 'Tu código de un solo uso (OTP)',
    text: `Tu código para reestablecer tu contraseña es: ${otpCode}`,
    html: `<p>Tu código de recuperación es: <strong>${otpCode}</strong></p>`
  };

  try {
    await this.mailerService.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send OTP email to ${email}`, error.stack);
    throw new Error('Failed to send OTP email');
  }
}

}
