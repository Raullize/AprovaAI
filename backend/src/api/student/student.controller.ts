import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetStudentDashboardStatsUseCase } from '../../application/student/use-cases/get-student-dashboard-stats.use-case';
import { GetStudentLeaderboardUseCase } from '../../application/student/use-cases/get-student-leaderboard.use-case';
import { GetStudentStreakLeaderboardUseCase } from '../../application/student/use-cases/get-student-streak-leaderboard.use-case';

@ApiTags('Student')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student')
export class StudentController {
  constructor(
    private readonly getStudentDashboardStatsUseCase: GetStudentDashboardStatsUseCase,
    private readonly getStudentLeaderboardUseCase: GetStudentLeaderboardUseCase,
    private readonly getStudentStreakLeaderboardUseCase: GetStudentStreakLeaderboardUseCase,
  ) {}

  @Get('dashboard-stats')
  @ApiOperation({
    summary: 'Estatísticas do Painel',
    description:
      'Retorna a ofensiva (streak) e as datas de atividade do mês informado. ' +
      'Se o parâmetro `month` não for fornecido, retorna dados do mês atual.',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Mês de referência no formato YYYY-MM (ex: 2026-05)',
    example: '2026-05',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso.',
  })
  getDashboardStats(
    @Request() req: { user: { id: string } },
    @Query('month') month?: string,
  ) {
    return this.getStudentDashboardStatsUseCase.execute({
      userId: req.user.id,
      month,
    });
  }

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Ranking de Líderes',
    description:
      'Retorna os top 10 estudantes com mais XP, a posição do usuário atual no ranking global ' +
      'e seu próprio entry (mesmo quando estiver fora do top 10).',
  })
  @ApiResponse({ status: 200, description: 'Ranking retornado com sucesso.' })
  async getLeaderboard(@Request() req: { user: { id: string } }) {
    return this.getStudentLeaderboardUseCase.execute({ userId: req.user.id });
  }

  @Get('streak-leaderboard')
  @ApiOperation({
    summary: 'Ranking de Ofensivas (Streak)',
    description:
      'Retorna os top 10 estudantes com maior bestStreak (recorde de ofensiva), ' +
      'a posição do usuário atual e seu próprio entry.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking de ofensivas retornado com sucesso.',
  })
  async getStreakLeaderboard(@Request() req: { user: { id: string } }) {
    return this.getStudentStreakLeaderboardUseCase.execute({
      userId: req.user.id,
    });
  }
}
