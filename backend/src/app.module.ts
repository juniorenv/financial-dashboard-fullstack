import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PayablesModule } from './modules/payables/payables.module';

@Module({
  imports: [PrismaModule, PayablesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
