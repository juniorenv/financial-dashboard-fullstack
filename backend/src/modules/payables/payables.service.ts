import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { PayableStatus } from 'src/generated/prisma/enums';
import { isPrismaNotFound } from 'src/common/prisma-error.util';

@Injectable()
export class PayablesService {
  constructor(private readonly prismaService: PrismaService) {}

  public findAll() {
    return this.prismaService.payable.findMany({ orderBy: { dueDate: 'asc' } });
  }

  public async findOne(id: string) {
    const payable = await this.prismaService.payable.findUnique({
      where: { id },
    });

    if (!payable) {
      throw new NotFoundException(`Conta a pagar com id ${id} não encontrada`);
    }

    return payable;
  }

  public create(dto: CreatePayableDto) {
    const { supplier, amount, dueDate, description, category, status } = dto;

    return this.prismaService.payable.create({
      data: {
        supplier,
        amount,
        dueDate,
        description,
        category,
        status: status ?? PayableStatus.PENDING,
      },
    });
  }

  public async update(id: string, dto: UpdatePayableDto) {
    try {
      return await this.prismaService.payable.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (isPrismaNotFound(error)) {
        throw new NotFoundException(
          `Conta a pagar com id ${id} não encontrada`,
        );
      }
      throw error;
    }
  }

  public async markAsPaid(id: string) {
    try {
      return await this.prismaService.payable.update({
        where: {
          id,
          status: PayableStatus.PENDING,
        },
        data: { status: PayableStatus.PAID },
      });
    } catch (error) {
      if (isPrismaNotFound(error)) {
        const payable = await this.prismaService.payable.findUnique({
          where: { id },
        });

        if (!payable) {
          throw new NotFoundException(
            `Conta a pagar com id ${id} não encontrada`,
          );
        }

        throw new ConflictException(
          `Conta a pagar com id ${id} já está marcada como paga`,
        );
      }

      throw error;
    }
  }

  public async remove(id: string) {
    try {
      return await this.prismaService.payable.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFound(error)) {
        throw new NotFoundException(
          `Conta a pagar com id ${id} não encontrada`,
        );
      }
      throw error;
    }
  }
}
