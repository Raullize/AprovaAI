import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Healthcheck',
    description:
      'Verifica a disponibilidade da API e a conexão com o banco PostgreSQL.',
  })
  @ApiResponse({
    status: 200,
    description: 'API e banco de dados saudáveis.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error'], example: 'ok' },
        info: {
          type: 'object',
          description: 'Detalhes dos indicadores verificados (ex: prisma).',
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço indisponível (banco de dados fora do ar).',
  })
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('prisma', this.prisma),
    ]);
  }
}
