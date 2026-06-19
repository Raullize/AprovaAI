import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetStudentDashboardStatsUseCase } from '../../application/student/use-cases/get-student-dashboard-stats.use-case';
import { GetStudentLeaderboardUseCase } from '../../application/student/use-cases/get-student-leaderboard.use-case';

@ApiTags('Student')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student')
export class StudentController {
  constructor(
    private readonly getStudentDashboardStatsUseCase: GetStudentDashboardStatsUseCase,
    private readonly getStudentLeaderboardUseCase: GetStudentLeaderboardUseCase,
  ) {}

  @Get('dashboard-stats')
  @ApiOperation({
    summary: 'Estatísticas do Painel',
    description: 'Retorna a ofensiva (streak) e as datas de atividade no mês atual.',
  })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso.' })
  getDashboardStats(@Request() req: { user: { id: string } }) {
    return this.getStudentDashboardStatsUseCase.execute({
      userId: req.user.id,
    });
  }

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Ranking de Líderes',
    description: 'Retorna os top 10 estudantes com mais XP.',
  })
  @ApiResponse({ status: 200, description: 'Ranking retornado com sucesso.' })
  async getLeaderboard() {
    return this.getStudentLeaderboardUseCase.execute();
  }
}
