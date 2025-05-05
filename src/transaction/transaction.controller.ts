import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { AuthGuard } from "../auth/auth.guard";
import { DeepPartial } from "typeorm";
import { Transaction } from "./entities/transaction.entity";

@Controller("transaction")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.transactionService.findAll();
  }

  @Post("order")
  async createOrder(@Body() body: any): Promise<any> {
    if (!body.transactionId) {
      throw new Error("transactionId is required");
    }
    return await this.transactionService.createOrder(body.transactionId);
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(@Body() body) {
    return this.transactionService.updateTransactionStatus(
      body.id,
      body.status,
      body?.validatedById,
      body?.reference,
      body?.description,
    );
  }

  @Post(":orderID/capture")
  async captureOrder(@Param("orderID") orderID: string) {
    return await this.transactionService.captureOrder(orderID);
  }

  @UseGuards(AuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.transactionService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.transactionService.remove(+id);
  }
}
