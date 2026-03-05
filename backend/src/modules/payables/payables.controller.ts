import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { PayablesService } from './payables.service';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';

@Controller('payables')
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @Get()
  public async findAll() {
    return await this.payablesService.findAll();
  }

  @Get(':id')
  public async findOne(@Param('id', ParseUUIDPipe) payableId: string) {
    return await this.payablesService.findOne(payableId);
  }

  @Post()
  public async create(@Body() createPayable: CreatePayableDto) {
    return await this.payablesService.create(createPayable);
  }

  @Put(':id')
  public async update(
    @Param('id', ParseUUIDPipe) payableId: string,
    @Body() updatePayable: UpdatePayableDto,
  ) {
    return await this.payablesService.update(payableId, updatePayable);
  }

  @Patch(':id/pay')
  public async markAsPaid(@Param('id', ParseUUIDPipe) payableId: string) {
    return await this.payablesService.markAsPaid(payableId);
  }

  @Delete(':id')
  public async remove(@Param('id', ParseUUIDPipe) payableId: string) {
    return await this.payablesService.remove(payableId);
  }
}
