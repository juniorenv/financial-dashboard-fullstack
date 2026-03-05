import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PayablesModule } from './modules/payables/payables.module';
import { ReceivablesModule } from './modules/receivables/receivables.module';

@Module({
  imports: [PrismaModule, PayablesModule, ReceivablesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
