import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { ReceivableStatus } from 'src/generated/prisma/enums';
import { CreateReceivableDto } from './create-receivable.dto';

export class UpdateReceivableDto extends PartialType(CreateReceivableDto) {
  @IsEnum(ReceivableStatus, { message: 'Status deve ser PENDING ou RECEIVED' })
  @IsOptional()
  status?: ReceivableStatus;
}
