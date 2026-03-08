import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  MaxLength,
  IsPositive,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PayableStatus } from 'src/generated/prisma/enums';

export class CreatePayableDto {
  @IsString()
  @IsNotEmpty({ message: 'Fornecedor é obrigatório' })
  @MaxLength(255)
  supplier!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor deve ser numérico com até 2 casas decimais' },
  )
  @IsPositive({ message: 'Valor deve ser positivo' })
  @Type(() => Number)
  amount!: number;

  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  @Type(() => Date)
  @IsDate()
  dueDate!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsEnum(PayableStatus, { message: 'Status deve ser PENDING ou PAID' })
  @IsOptional()
  status?: PayableStatus = PayableStatus.PENDING;
}
