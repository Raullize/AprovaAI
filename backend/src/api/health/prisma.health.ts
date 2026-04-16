import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async pingCheck(
    key: string,
    prismaService: PrismaService,
  ): Promise<HealthIndicatorResult> {
    try {
      await prismaService.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (e) {
      return this.getStatus(key, false, { message: (e as Error).message });
    }
  }
}
