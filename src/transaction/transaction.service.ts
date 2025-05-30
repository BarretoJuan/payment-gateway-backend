import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

import { Transaction } from "./entities/transaction.entity";
import {  Equal, In, IsNull, LessThan,  MoreThan,  Not,  Repository } from "typeorm";
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
    @Inject(forwardRef(() => CourseService))
    private readonly coursesService: CourseService,
    @Inject(forwardRef(() => UserCourseService))
    private readonly userCourseService: UserCourseService,
  ) {}

  async externalTransactionJson() { 
    const transactions = await this.transactionsRepository.find({
      relations: ["course", "user", "validatedBy"],
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        amount: true,
        description: true,
        paymentMethod: true,
        status: true,
        course: {
          id: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          price: true,
          name: true,
          description: true,
          image: true,
        },
        user: {
          id: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          email: true,
          identificationNumber: true,
          firstName: true,
          lastName: true,
          role: true
        },
        validatedBy: {
          id: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          email: true,
          identificationNumber: true,
          firstName: true,
          lastName: true,
          role: true
        }
      },
      where: {
        status: In(["completed", "rejected", "in_process", "ready_to_be_checked"]),
        paymentMethod: In(["paypal", "zelle"]),
      },
      order: { createdAt: "DESC" },
    });
    // Filter transactions whose amount (as number) is more than 0
    const filteredTransactions = transactions.filter(t => Number(t.amount) > 0);
    
    return filteredTransactions;
  }

  async getLastTransactions() {
    let transactions = await this.transactionsRepository.find({
      
      relations: ["course", "user"],
      select: { id: true, course: {name: true} , user: {email: true}, status: true, amount: true },
      where: {
        status: In(["completed", "rejected"]),
        paymentMethod: In(["paypal", "zelle"]),
      },
      // Order by createdAt in descending order to get the latest transactions
      order: { createdAt: "DESC" },
    });
    // Filter transactions whose amount (as number) is more than 0
    transactions = transactions.filter(t => Number(t.amount) > 0);
    
    let returnTransactions: any[] = [];

 for (const t of transactions) {
        returnTransactions.push({
        transactionId: t.id,
        courseName: t.course.name,
        userEmail: t.user.email,
        status: t.status,
      });
      console.log("returnTransactions", returnTransactions);
 }

    return returnTransactions.slice(0, 10);
  }

  async create(createTransactionDto: CreateTransactionDto) {
    console.log(
      "createTransactionDto111",
      createTransactionDto,
    )

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
      console.log("userCourseDto222", userCourseDto);
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
        orderPrice = orderPrice - Number(userCourse!.balance)

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
      console.log("Balance - Precio - Precio a pagar111", userBalance, orderPrice.toString(), finalAmount);
      createTransactionDto.userBalanceAmount = orderPrice.toString();
      finalAmount = 0;
      //userCourse!.balance = orderPrice.toString();
      userCourse!.status = "not_acquired";
      await this.userCourseService.update(userCourse!.id, {
        //balance: userCourse!.balance,
        status: userCourse!.status,
      });
    } else {
      finalAmount = orderPrice - userBalance;
      console.log("Balance - Precio - Precio a pagar222", userBalance, orderPrice.toString(), finalAmount);
      createTransactionDto.userBalanceAmount = userBalance.toString();
      console.log("Balance - Precio - Precio a pagar", userBalance, orderPrice, finalAmount);
      user.balance = "0";
    }

    // await this.usersService.update(userId, { balance: user.balance });
    createTransactionDto.amount = finalAmount.toString();
    let transactionToCreate: Transaction | undefined;
    let transaction: Transaction;

    if (createTransactionDto.paymentMethod === null) {
      createTransactionDto.user = user;
      createTransactionDto.course = course;
      transaction = this.transactionsRepository.create({
        ...createTransactionDto,
      });
      console.log("444", createTransactionDto)
      try {
        transaction.description = "Pago " + course.name}
      catch (error) { 
        console.error("Error setting transaction description:", error);
        transaction.description = "Pago curso";
      }
      
      transactionToCreate = await this.transactionsRepository.save(transaction);
      console.log("333", transactionToCreate);
    } 
    else {
      return { error: true, message: "Payment method not found" };
    }


    return { transaction, finalAmount, transactionId: transactionToCreate?.id };
  }

   async paymentMethodPercentage() {

    const paypalCount = await this.transactionsRepository.count({
      where: { paymentMethod: Equal("paypal"), status: Equal("completed") },
    });

    const zelleCount = await this.transactionsRepository.count({
      where: { paymentMethod: Equal("zelle"), status: Equal("completed") },
    });

    const totalCount = paypalCount + zelleCount;
    console.log("paypalCount", paypalCount, "zelleCount", zelleCount, "totalCount", totalCount);
    const paypalPercentage = (totalCount > 0 ? (paypalCount / totalCount) * 100 : 0).toFixed(2);
    const zellePercentage = (totalCount > 0 ? (zelleCount / totalCount) * 100 : 0).toFixed(2);

    return [
       {name : "paypal", percentage: paypalPercentage} ,
       {name : "zelle", percentage: zellePercentage} 
    ]
    }

  async getDashboardTransaction() {
    let transactions = await this.transactionsRepository.find({
      select: { id: true, amount: true, createdAt: true },
      where: {
      status: "completed",
      paymentMethod: In(["paypal", "zelle"]),
      },order : { createdAt: "DESC" },
    });
    // Filter transactions whose amount (as number) is more than 0
    transactions = transactions.filter(t => Number(t.amount) > 0);

   return transactions;
  }

  async getOperatorTransactionsHistory(userId: string) {
  
    const  transactions = await this.transactionsRepository.find({
      where: { validatedBy: { id: Equal(userId) } },
      relations: ["course", "user"],
    });
    return transactions
  }

  async getUserTransactionsHistory(userId: string) {

    const transactions = await this.transactionsRepository.find({
      where: { user : {id: Equal(userId)}, status: Not("in_process") && Not(IsNull())  },
      relations: ["course", "user"],
    });
    return transactions;
  }
  async updateTransactionStatus({
    id,
    status,
    paymentMethod,
    validatedBy,
    reference,
    description
}: {
    id: string,
    status?: "completed" | "rejected" | null,
    paymentMethod?: "zelle" | "paypal" | null,
    validatedBy?: string,
    reference?: string,
    description?: string
}) {
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

    //     // 💰 Aplicar balance del usuario
    // const userBalance = user.balance ? +user.balance : 0;

    // let orderPrice = +!transaction.amount;
    // let finalAmount = orderPrice;

    // if (userBalance >= orderPrice) {

    //   user.balance = (userBalance - orderPrice).toString();
    //   transaction.userBalanceAmount = orderPrice.toString();
    //   finalAmount = 0;
    //   userCourse!.balance = orderPrice.toString();
    //   userCourse!.status = "not_acquired";
    //   await this.userCourseService.update(userCourse!.id, {
    //     balance: userCourse!.balance,
    //     status: userCourse!.status,
    //   });
    // } else {
    //   finalAmount = orderPrice - userBalance;
    //   transaction.userBalanceAmount = userBalance.toString();
    //   console.log("Balance - Precio - Precio a pagar", userBalance, orderPrice, finalAmount);
    //   user.balance = "0";
    // }

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
    if (paymentMethod !== undefined) {
      transaction.paymentMethod = paymentMethod;
    }
    if (status !== undefined) {
      transaction.status = status;
    }
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
      // if (userCourseBalance < coursePrice) {
      //   const remaining = coursePrice - userCourseBalance;

      //   if (transactionAmount > remaining) {
      //     userCourseBalance += remaining;
      //     await this.userCourseService.update(userCourse.id, {
      //       balance: userCourseBalance.toString(),
      //     });
      //     const remainingTransactionAmount = transactionAmount - remaining;
      //     const UserBalance = userCourse.user.balance
      //       ? +userCourse.user.balance
      //       : 0;
      //     const newUserBalance = UserBalance + remainingTransactionAmount;
      //     await this.usersService.update(userCourse.user.id, {
      //       balance: newUserBalance.toString(),
      //     });
      //   } else {
      //     userCourseBalance += transactionAmount;
      //     await this.userCourseService.update(userCourse.id, {
      //       balance: userCourseBalance.toString(),
      //     });
      //   }
      // } else {
      //   await this.usersService.update(userCourse.user.id, {
      //     balance: (Number(userCourse.user.balance) + Number(transactionAmount)).toString(),
      //   });
      // }
      await this.userCourseService.update(userCourse.id, {
        status: "acquired",
        balance: (Number(userCourseBalance)+  Number(transaction.userBalanceAmount)+Number(transaction.amount)).toString(),
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
      order: { createdAt: "DESC" },
    });
  }

  async findOperator() {
       return await this.transactionsRepository.find({
      relations: ["course", "user", "validatedBy"],
      order: { createdAt: "DESC" },
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
    transaction.status = "ready_to_be_checked";
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
        createdAt: LessThan(new Date(Date.now() - 1 * 10 * 60 * 1000)), // 10 minute ago
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
      // if (transaction.userBalanceAmount && transaction.status === null) {
      //   const userBalance = transaction.user.balance
      //     ? +transaction.user.balance
      //     : 0;
      //   const newUserBalance = userBalance + +transaction.userBalanceAmount;
      //   await this.usersService.update(transaction.user.id, {
      //     balance: newUserBalance.toString(),
      //   });
      // }
      await this.transactionsRepository.delete(transaction.id);
    }
  }


   async cancelExpiredTransactionsByUser(userId : string) {
    console.log("Cancelling expired transactions BY USER ", userId);
    let transactions = await this.transactionsRepository.find({
      where: {
        status: "in_process",
        user: {id: Equal(userId)},
      },
      relations: ["user", "course"],
    });
    const nullTransactions = await this.transactionsRepository.find({
      where: {
        status: IsNull(),
        user: {id: Equal(userId)},  
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
      await this.transactionsRepository.delete(transaction.id);
    }
  }
}
