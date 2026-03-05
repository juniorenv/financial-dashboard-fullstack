import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { ReceivableStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';

@Injectable()
export class ReceivablesService {
  constructor(private readonly prismaService: PrismaService) {}

  public findAll() {
    return this.prismaService.receivable.findMany({
      orderBy: { dueDate: 'asc' },
    });
  }

  public async findOne(id: string) {
    const receivable = await this.prismaService.receivable.findUnique({
      where: { id },
    });

    if (!receivable) {
      throw new NotFoundException(
        `Conta a receber com id ${id} não encontrada`,
      );
    }

    return receivable;
  }

  public create(dto: CreateReceivableDto) {
    return this.prismaService.receivable.create({ data: dto });
  }

  public async update(id: string, dto: UpdateReceivableDto) {
    try {
      return await this.prismaService.receivable.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (this.isPrismaNotFound(error)) {
        throw new NotFoundException(
          `Conta a receber com id ${id} não encontrada`,
        );
      }
      throw error;
    }
  }

  public async markAsReceived(id: string) {
    try {
      return await this.prismaService.receivable.update({
        where: {
          id,
          status: ReceivableStatus.PENDING,
        },
        data: { status: ReceivableStatus.RECEIVED },
      });
    } catch (error) {
      if (this.isPrismaNotFound(error)) {
        const receivable = await this.prismaService.receivable.findUnique({
          where: { id },
        });

        if (!receivable) {
          throw new NotFoundException(
            `Conta a receber com id ${id} não encontrada`,
          );
        }

        throw new ConflictException(
          `Conta a receber com id ${id} já está marcada como recebida`,
        );
      }
      throw error;
    }
  }

  public async remove(id: string) {
    try {
      return await this.prismaService.receivable.delete({ where: { id } });
    } catch (error) {
      if (this.isPrismaNotFound(error)) {
        throw new NotFoundException(
          `Conta a receber com id ${id} não encontrada`,
        );
      }
      throw error;
    }
  }

  private isPrismaNotFound(e: unknown): boolean {
    return (
      e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025'
    );
  }
}
