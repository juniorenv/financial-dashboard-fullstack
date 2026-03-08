import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDate,
  MaxLength,
  IsEnum,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReceivableStatus } from 'src/generated/prisma/enums';

export class CreateReceivableDto {
  @IsString()
  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  @MaxLength(255)
  client!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor deve ser numérico com até 2 casas decimais' },
  )
  @IsPositive({ message: 'Valor deve ser positivo' })
  @Max(99_999_999.99, { message: 'Valor máximo permitido é R$ 99.999.999,99' })
  @Type(() => Number)
  amount!: number;

  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  @Type(() => Date)
  @IsDate()
  dueDate!: Date;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsEnum(ReceivableStatus, { message: 'Status deve ser PENDING ou RECEIVED' })
  @IsOptional()
  status?: ReceivableStatus;
}
