import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreatePayableDto } from './create-payable.dto';
import { PayableStatus } from 'src/generated/prisma/client';

export class UpdatePayableDto extends PartialType(CreatePayableDto) {
  @IsEnum(PayableStatus, { message: 'Status deve ser PENDING ou PAID' })
  @IsOptional()
  status?: PayableStatus;
}
