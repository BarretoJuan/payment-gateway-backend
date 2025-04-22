import { Injectable } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from "@nestjs/typeorm";
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Transaction } from "./entities/transaction.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class TransactionService {
  private readonly baseUrl = 'https://api-m.sandbox.paypal.com';
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  create(createTransactionDto: DeepPartial<Transaction>) {
    
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

  async createOrder(cart: any) {
    const accessToken = await this.generateAccessToken();
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '500.00',
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
