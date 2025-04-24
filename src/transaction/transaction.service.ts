import { Injectable } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from "@nestjs/typeorm";
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Transaction } from "./entities/transaction.entity";
import { DeepPartial, Equal, Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { CourseService } from "../course/course.service";
import { UserCourseService } from "../user-course/user-course.service";
import { validate } from "class-validator";

@Injectable()
export class TransactionService {
  private readonly baseUrl = 'https://api-m.sandbox.paypal.com';
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private readonly usersService: UserService,
    private readonly coursesService: CourseService,
    private readonly userCourseService: UserCourseService,
  ) {}

  async create(createTransactionDto: DeepPartial<Transaction>) {

    const userId = createTransactionDto.user as string;
    const courseId = createTransactionDto.course as string;

    const user = await this.usersService.findOne({
        where: { id: Equal(userId) },
      });

    const course = await this.coursesService.findOne({ where: { id: Equal(courseId)  }, relations: ["installments"] });


    if (!user || !course) {
      return "User or course not found";
    }

    const userCourse = await this.userCourseService.findOne({
      where: { user: Equal(userId), course: Equal(courseId) },});

    if (!userCourse) {
      return "User course not found";
    }

    let orderPrice: number;

    if (course.paymentScheme === 'single_payment' ) {
      orderPrice = course.price ? +course.price : 0;
    }

    if (course.paymentScheme === 'installments' ) {
      if (course.installments) {

        const installments = course.installments;
        let totalPercentage = 0;
        for (const installment of installments) {
          if (installment.percentage && installment.date <= new Date()) {
            totalPercentage += +installment.percentage;
          }
        }
        orderPrice = course.price ? (totalPercentage / 100 * +course.price) : 0;
      } else {
        orderPrice = 0;
      }
    }
    else {
      orderPrice = 0;
    }

    // 💰 Aplicar balance del usuario
    const userBalance = user.balance ? +user.balance: 0;
    let finalAmount = orderPrice;

    if (userBalance >= orderPrice) {
      user.balance = (userBalance - orderPrice).toString();
      finalAmount = 0;
      userCourse.balance = orderPrice.toString();
      userCourse.status = 'acquired';
      await this.userCourseService.update(userCourse.id, { balance: userCourse.balance, status: userCourse.status });

    } else {
      finalAmount = orderPrice - userBalance;
      user.balance = '0';
    }

    await this.usersService.update(userId, { balance: user.balance });
    createTransactionDto.amount = finalAmount.toString();


    if (createTransactionDto.paymentMethod === 'paypal') {
      createTransactionDto.status = 'in_process';
      const order = await this.transactionsRepository.save(createTransactionDto);
    }


    else if (createTransactionDto.paymentMethod === 'zelle') {
      createTransactionDto.status = 'ready_to_be_checked';
      const transaction = await this.transactionsRepository.save(createTransactionDto);
    }

    return {orderPrice}
    
  }

  async updateTransactionStatus(id: string, status: "completed" | "rejected", validatedBy?: string) 
   {
    const transaction = await this.transactionsRepository.findOne({ where: { id: Equal(id) } });
    if (!transaction) {
      return "Transaction not found";
    }

    const userCourse = await this.userCourseService.findOne({
      where: { user: Equal(transaction.user.id), course: Equal(transaction.course.id) }, relations : ["user", "course"] });

    if (!userCourse) {
      return "User course not found";
    }
    
    let userOperator;
    if (validatedBy) {
       userOperator = await this.usersService.findOne({ where: { id: Equal(validatedBy) } });
      if (!userOperator) {
        return "User not found";
      }
      transaction.validatedBy = userOperator;
    }

    transaction.status = status;
    transaction.updatedAt = new Date(); // Set to null if not already set
    await this.transactionsRepository.save(transaction);
    const transactionAmount = transaction.amount ? +transaction.amount : 0;
    const coursePrice = transaction.course.price ? +transaction.course.price : 0;
    let userCourseBalance = userCourse ? +userCourse.balance : 0;
    if (transaction.status === 'completed') {
    if (userCourseBalance < coursePrice) {
      const remaining = coursePrice - userCourseBalance;
      
      if (transactionAmount > remaining) {
        userCourseBalance += remaining;
        await this.userCourseService.update(userCourse.id, {balance:  userCourseBalance.toString()});
        const remainingTransactionAmount = transactionAmount - remaining;
        const UserBalance = userCourse.user.balance ? +userCourse.user.balance : 0;
        const newUserBalance = UserBalance + remainingTransactionAmount;
        await this.usersService.update(userCourse.user.id, {balance: newUserBalance.toString()});
        
      }
      else { 
        userCourseBalance += transactionAmount;
        await this.userCourseService.update(userCourse.id, {balance:  userCourseBalance.toString()});
      }
    }
    else { 
      await this.usersService.update(userCourse.user.id, {balance: userCourse.user.balance + transactionAmount.toString()});

    }
  }

    return transaction;


    
  }     
                                                                                                          

  async findAll() {
    return await this.transactionsRepository.find({
      relations: ["course", "user", "validatedBy"],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }

  private async generateAccessToken(): Promise<string> {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    return response.data.access_token;
  }

  async createOrder(price: number) {
    const accessToken = await this.generateAccessToken();
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: price || 100,
          },
        },
      ],
    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/v2/checkout/orders`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    return response.data;
  }

  async captureOrder(orderID: string) {
    const accessToken = await this.generateAccessToken();

    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/v2/checkout/orders/${orderID}/capture`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    return response.data;
  }
}
