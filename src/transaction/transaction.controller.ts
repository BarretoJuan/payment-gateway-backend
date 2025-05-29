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
import { TransactionService } from "./transaction.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { AuthGuard } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";


@Controller("transaction")
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly authService: AuthService
  ) {}

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


  @Get("dashboard-transactions")
  async dashboardTransactions() {
    try {
      return await this.transactionService.getDashboardTransaction();
    }
    catch (error) {
      return [];
    }
  }

  @Get("payment-method-percentage")
  async paymentMethodPercentage() {
    try {
      return await this.transactionService.paymentMethodPercentage();
    } catch (error) {
      return [
       {name : "paypal", percentage: 0} ,
       {name : "zelle", percentage: 0} 
    ];
    }
  }
  
  @UseGuards(AuthGuard)
  @Get("user-transactions-history")
  async findTransactionsHistory(@Body() body: any, @Req() req: Request, @Body('token') token: string) {
    const accessToken: string = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = await this.authService.validateUser(accessToken);
    if (!decodedToken) {
      throw new UnauthorizedException("Invalid token");
    }
  console.log("decodedToken", decodedToken);
  return await this.transactionService.getUserTransactionsHistory(decodedToken!.user!.id);      
  }

  @UseGuards(AuthGuard)
  @Get("operator-transactions-history")
  async findOperatorTransactionsHistory(@Body() body: any, @Req() req: Request, @Body('token') token: string) {
    const accessToken: string = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = await this.authService.validateUser(accessToken);
    if (!decodedToken) {
      throw new UnauthorizedException("Invalid token");
    }
    console.log("decodedToken", decodedToken);
    if (decodedToken!.user!.role !== "accounting" && decodedToken!.user!.role !== "admin") {
      console.log("User is not an operator", decodedToken!.user!.role); 
        throw new UnauthorizedException("User is not an operator");
    }
  
    return await this.transactionService.getOperatorTransactionsHistory(decodedToken!.user!.id);

  }

  
 @UseGuards(AuthGuard)
  @Get("operator")
  findOperatorTransactions() {
    return this.transactionService.findOperator();
  }
  @Post("order")
  async createOrder(@Body() body: any): Promise<any> {
    if (!body.transactionId) {
      throw new Error("transactionId is required");
    }
    return await this.transactionService.createOrder(body.transactionId);
  }

  @Patch("reference")
  async setReference(
    @Body() body : {id: string, reference: string} ) {
      const transaction = await this.transactionService.findOne(body.id);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.reference) {
        throw new Error("Transaction already has a reference");
      }
      
      if (transaction.paymentMethod !== "zelle") {
        throw new Error("Transaction is not a Zelle transaction");
      }

      return await this.transactionService.setReference(
        transaction,
        body.reference,
      );
    }

  @Patch()
  @UseGuards(AuthGuard)
  update(@Body() body: { id: string, status?: "completed" | "rejected" | null, paymentMethod?: "zelle" | "paypal" | null, validatedBy?: string, reference?: string, description?: string }) {
    return this.transactionService.updateTransactionStatus(body);
  }

  @Post(":orderID/capture")
  async captureOrder(@Param("orderID") orderID: string) {
    return await this.transactionService.captureOrder(orderID);
  }

  @UseGuards(AuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.transactionService.findOne(id);
  }


  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.transactionService.remove(+id);
  }
}
