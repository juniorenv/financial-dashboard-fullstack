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
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { ReceivablesService } from './receivables.service';

@Controller('receivables')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Get()
  public findAll() {
    return this.receivablesService.findAll();
  }

  @Get(':id')
  public findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.receivablesService.findOne(id);
  }

  @Post()
  public create(@Body() dto: CreateReceivableDto) {
    return this.receivablesService.create(dto);
  }

  @Put(':id')
  public update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReceivableDto,
  ) {
    return this.receivablesService.update(id, dto);
  }

  @Patch(':id/receive')
  public markAsReceived(@Param('id', ParseUUIDPipe) id: string) {
    return this.receivablesService.markAsReceived(id);
  }

  @Delete(':id')
  public remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.receivablesService.remove(id);
  }
}
