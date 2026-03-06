import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PayablesModule } from './modules/payables/payables.module';
import { ReceivablesModule } from './modules/receivables/receivables.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    PayablesModule,
    ReceivablesModule,
    ExchangeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
