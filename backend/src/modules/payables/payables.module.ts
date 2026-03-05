import { Module } from '@nestjs/common';
import { PayablesService } from './payables.service';
import { PayablesController } from './payables.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [PayablesService],
  controllers: [PayablesController],
  imports: [PrismaModule],
  exports: [PayablesService],
})
export class PayablesModule {}
