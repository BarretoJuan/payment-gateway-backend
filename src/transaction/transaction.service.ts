import { Injectable } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

import { Transaction } from "./entities/transaction.entity";
import {  Equal, In, IsNull, LessThan,  Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { CourseService } from "../course/course.service";
import { UserCourseService } from "../user-course/user-course.service";

import { CreateUserCourseDto } from "../user-course/dto/create-user-course.dto";

import { Cron } from "@nestjs/schedule";

@Injectable()
export class TransactionService {
  private readonly baseUrl = "https://api-m.sandbox.paypal.com";
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private readonly usersService: UserService,
    private readonly coursesService: CourseService,
    private readonly userCourseService: UserCourseService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {

    const userId = createTransactionDto?.userId as string;
    const courseId = createTransactionDto?.courseId as string;

    const user = await this.usersService.findOne({
      where: { id: Equal(userId) },
    });

    const course = await this.coursesService.findOne({
      where: { id: Equal(courseId) },
      relations: ["installments"],
    });

    if (!user || !course) {
      return { error: true, message: "User or course not found" };
    }

    let userCourse = await this.userCourseService.findOne({
      where: { user: Equal(userId), course: Equal(courseId) },
    });

    if (!userCourse) {
      const userCourseDto: CreateUserCourseDto = {
        userId: userId,
        courseId: courseId,
      };
      await this.userCourseService.create(userCourseDto);
      userCourse = await this.userCourseService.findOne({
        where: { user: Equal(userId), course: Equal(courseId) },
      });
    }

    let orderPrice: number;

    if (course.paymentScheme === "single_payment") {

      orderPrice = course.price ? +course.price : 0;

    } else if (course.paymentScheme === "installments") {

      if (course.installments.length > 0) {
        const installments = course.installments;

        let totalPercentage = 0;
        for (const installment of installments) {
          if (new Date(installment.date) <= new Date()) {

            totalPercentage += +installment.percentage;

          } else {
            console.log("fecha no cumplida", installment.date, new Date());
          }
        }

        orderPrice = course.price ? (totalPercentage / 100) * +course.price : 0;

      } else {

        orderPrice = 0;
      }
    } else {

      orderPrice = 0;
    }

    // 💰 Aplicar balance del usuario
    const userBalance = user.balance ? +user.balance : 0;

    orderPrice = +orderPrice;
    let finalAmount = orderPrice;

    if (userBalance >= orderPrice) {

      user.balance = (userBalance - orderPrice).toString();
      createTransactionDto.userBalanceAmount = orderPrice.toString();
      finalAmount = 0;
      userCourse!.balance = orderPrice.toString();
      userCourse!.status = "acquired";
      await this.userCourseService.update(userCourse!.id, {
        balance: userCourse!.balance,
        status: userCourse!.status,
      });
    } else {
      finalAmount = orderPrice - userBalance;
      createTransactionDto.userBalanceAmount = userBalance.toString();
      console.log("Balance - Precio - Precio a pagar", userBalance, orderPrice, finalAmount);
      user.balance = "0";
    }

    // await this.usersService.update(userId, { balance: user.balance });
    createTransactionDto.amount = finalAmount.toString();
    let transactionToCreate: Transaction | undefined;
    let transaction: Transaction;
    if (createTransactionDto.paymentMethod === "paypal") {
      createTransactionDto.status = "in_process";
      transaction = this.transactionsRepository.create({
        user: user,
        course: course,
        amount: createTransactionDto.amount,
        status: createTransactionDto.status,
        paymentMethod: createTransactionDto.paymentMethod,
      });
      transactionToCreate = await this.transactionsRepository.save(transaction);
    } else if (createTransactionDto.paymentMethod === "zelle") {
      createTransactionDto.status = "ready_to_be_checked";

      createTransactionDto.user = user;
      createTransactionDto.course = course;
      transaction = this.transactionsRepository.create({
...createTransactionDto
      });

      transactionToCreate = await this.transactionsRepository.save(transaction);
    }
    else if (createTransactionDto.paymentMethod === null) {
      createTransactionDto.user = user;
      createTransactionDto.course = course;
      transaction = this.transactionsRepository.create({
        ...createTransactionDto,
      });
      transactionToCreate = await this.transactionsRepository.save(transaction);
    } 
    else {
      return { error: true, message: "Payment method not found" };
    }

    // if (finalAmount === 0) { 
    //   const userCourse = await this.userCourseService.findOne({
    //     where: { user: Equal(userId), course: Equal(courseId) },
    //   });
    //   if (userCourse) {
    //     userCourse.status = "acquired";
    //     await this.userCourseService.update(userCourse.id, {
    //       status: userCourse.status,
    //     });
    //   }

    //   const transactionToUpdate = await this.transactionsRepository.findOne({
    //     where: { id: Equal(transactionToCreate.id) },
    //     relations: ["user", "course"],
    //   });
    //   if (transactionToUpdate) {
    //     transactionToUpdate.status = "completed";
    //     await this.transactionsRepository.save(transactionToUpdate);
    //   }
    // }

    return { transaction, finalAmount, transactionId: transactionToCreate?.id };
  }

  async updateTransactionStatus(
    id: string,
    status: "completed" | "rejected" | null,
    paymentMethod: "zelle" | "paypal" | null,
    validatedBy?: string,
    reference?: string,
    description?: string,
  ) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id: Equal(id) },
      relations: ["user", "course"],
    });
    if (!transaction) {
      return "Transaction not found";
    }

    const userCourse = await this.userCourseService.findOne({
      where: {
        user: Equal(transaction.user.id),
        course: Equal(transaction.course.id),
      },
      relations: ["user", "course"],
    });

    if (!userCourse) {
      return "User course not found";
    }

    const user = await this.usersService.findOne({where : { id: Equal(transaction.user.id) }});
    if (!user) {
      return "User not found";
    }

    let userOperator;
    if (validatedBy) {
      userOperator = await this.usersService.findOne({
        where: { id: Equal(validatedBy) },
      });
      if (!userOperator) {
        return "User not found";
      }
      transaction.validatedBy = userOperator;
    }

    if (reference) {
      transaction.reference = reference;
    }
    if (description) {
      transaction.description = description;
    }
    if (status === transaction.status) {
      return "Transaction already has this status";
    }
    transaction.paymentMethod = paymentMethod;
    transaction.status = status;
    transaction.updatedAt = new Date(); // Set to null if not already set
    await this.transactionsRepository.save(transaction);
    const transactionAmount = transaction.amount ? +transaction.amount : 0;
    const coursePrice = transaction.course.price
      ? +transaction.course.price
      : 0;
    let userCourseBalance = userCourse ? +userCourse.balance : 0;
    if (transaction.status === "completed") {
      user.balance = (Number(user.balance) - Number(transaction.userBalanceAmount)).toString();
      await this.usersService.update(user.id, {
        balance: user.balance,
      });
      if (userCourseBalance < coursePrice) {
        const remaining = coursePrice - userCourseBalance;

        if (transactionAmount > remaining) {
          userCourseBalance += remaining;
          await this.userCourseService.update(userCourse.id, {
            balance: userCourseBalance.toString(),
          });
          const remainingTransactionAmount = transactionAmount - remaining;
          const UserBalance = userCourse.user.balance
            ? +userCourse.user.balance
            : 0;
          const newUserBalance = UserBalance + remainingTransactionAmount;
          await this.usersService.update(userCourse.user.id, {
            balance: newUserBalance.toString(),
          });
        } else {
          userCourseBalance += transactionAmount;
          await this.userCourseService.update(userCourse.id, {
            balance: userCourseBalance.toString(),
          });
        }
      } else {
        await this.usersService.update(userCourse.user.id, {
          balance: userCourse.user.balance + transactionAmount.toString(),
        });
      }
      await this.userCourseService.update(userCourse.id, {
        status: "acquired",
        balance: userCourseBalance.toString(),
      });
    }
    if (transaction.status === "rejected") {
      if (transaction.userBalanceAmount) {
        const userBalance = transaction.user.balance
          ? +transaction.user.balance
          : 0;
        const newUserBalance = userBalance + +transaction.userBalanceAmount;
        await this.userCourseService.update(userCourse.id, {
          balance: (+userCourse.balance - (transaction.amount ? +transaction.amount : 0)).toString(),
          status: "not_acquired",
        });
        await this.usersService.update(transaction.user.id, {
          balance: newUserBalance.toString(),
        });
      }
    }

    return transaction;
  }

  async findAll() {
    return await this.transactionsRepository.find({
      relations: ["course", "user", "validatedBy"],
    });
  }

  async findOperator() {
       return await this.transactionsRepository.find({
      relations: ["course", "user", "validatedBy"],
      where: {
        status: "ready_to_be_checked",
  }})
  }

  async findOne(id: string) {
    return await this.transactionsRepository.findOne({
      where: { id: Equal(id) }});
  }

  async setReference(transaction: Transaction, reference: string) {
    transaction.reference = reference;
    await this.transactionsRepository.save(transaction);
    return transaction;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }

  private async generateAccessToken(): Promise<string> {
    const clientId = this.configService.get<string>("PAYPAL_CLIENT_ID");
    const clientSecret = this.configService.get<string>("PAYPAL_CLIENT_SECRET");
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      ),
    );

    return response.data.access_token;
  }

  async createOrder(transactionId: string) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id: Equal(transactionId) },
      relations: ["user", "course"],
    });
    if (!transaction) {
      return "Transaction not found";
    }

    const accessToken = await this.generateAccessToken();
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: transaction?.amount,
          },
        },
      ],
    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/v2/checkout/orders`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
    console.log("response", response.data);
    return { data: response.data, transactionId };
  }

  async captureOrder(orderID: string) {
    const accessToken = await this.generateAccessToken();

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/v2/checkout/orders/${orderID}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );

    return response.data;
  }

  @Cron('*/10 * * * *')
  async cancelExpiredTransactions() {
    console.log("Cancelling expired transactions");
    let transactions = await this.transactionsRepository.find({
      where: {
        status: "in_process",
        createdAt: LessThan(new Date(Date.now() - 1 * 10 * 60 * 1000)), // 10 minutes ago
      },
      relations: ["user", "course"],
    });
    const nullTransactions = await this.transactionsRepository.find({
      where: {
        status: IsNull(),
        createdAt: LessThan(new Date(Date.now() - 1 * 1 * 60 * 1000)), // 1 hour ago
      },
      relations: ["user", "course"],});
      transactions = [...transactions, ...nullTransactions];
    let userCourse: any;
    for (const transaction of transactions) {
      userCourse = await this.userCourseService.findOne({
        where: {
          user: Equal(transaction.user.id),
          course: Equal(transaction.course.id),
        },
      });
      if (userCourse) {
        await this.userCourseService.update(userCourse.id, {
          status: "transactable"})
      }
      if (transaction.userBalanceAmount) {
        const userBalance = transaction.user.balance
          ? +transaction.user.balance
          : 0;
        const newUserBalance = userBalance + +transaction.userBalanceAmount;
        await this.usersService.update(transaction.user.id, {
          balance: newUserBalance.toString(),
        });
      }
      await this.transactionsRepository.delete(transaction.id);
    }
  }
}
