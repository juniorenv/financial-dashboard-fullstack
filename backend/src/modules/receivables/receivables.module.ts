import { Module } from '@nestjs/common';
import { ReceivablesController } from './receivables.controller';
import { ReceivablesService } from './receivables.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ReceivablesController],
  providers: [ReceivablesService],
  imports: [PrismaModule],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
