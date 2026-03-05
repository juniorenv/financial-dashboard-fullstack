import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDate,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

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
}
