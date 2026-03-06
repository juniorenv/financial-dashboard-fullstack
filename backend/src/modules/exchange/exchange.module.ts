import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [ExchangeController],
  providers: [ExchangeService],
  imports: [HttpModule],
})
export class ExchangeModule {}
