import { Prisma } from 'src/generated/prisma/client';

export const isPrismaNotFound = (e: unknown): boolean =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025';
