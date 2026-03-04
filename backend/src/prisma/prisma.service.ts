import 'dotenv/config';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  public async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
      this.logger.log('✅ Prisma connected to Postgres');
    } catch (error) {
      this.logger.error('❌ Prisma connection error:', error);
      throw error;
    }
  }

  public async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Prisma disconnected from Postgres');
  }
}
