import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function assertDeletable(error: unknown, message: string): void {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    throw new ConflictException(message);
  }
  throw error;
}