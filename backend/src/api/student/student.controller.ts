import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  updateStudentPasswordSchema,
  updateStudentProfileSchema,
  UpdateStudentPasswordDto,
  UpdateStudentProfileDto,
} from './dto/student.dto';
import { GetStudentProfileUseCase } from '../../application/student/use-cases/get-student-profile.use-case';
import { UpdateStudentProfileUseCase } from '../../application/student/use-cases/update-student-profile.use-case';
import { UpdateStudentPasswordUseCase } from '../../application/student/use-cases/update-student-password.use-case';
import { DeleteStudentAccountUseCase } from '../../application/student/use-cases/delete-student-account.use-case';
import { GetStudentDashboardStatsUseCase } from '../../application/student/use-cases/get-student-dashboard-stats.use-case';
import { GetStudentLeaderboardUseCase } from '../../application/student/use-cases/get-student-leaderboard.use-case';

@ApiTags('Student')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student')
export class StudentController {
  constructor(
    private readonly getStudentProfileUseCase: GetStudentProfileUseCase,
    private readonly updateStudentProfileUseCase: UpdateStudentProfileUseCase,
    private readonly updateStudentPasswordUseCase: UpdateStudentPasswordUseCase,
    private readonly deleteStudentAccountUseCase: DeleteStudentAccountUseCase,
    private readonly getStudentDashboardStatsUseCase: GetStudentDashboardStatsUseCase,
    private readonly getStudentLeaderboardUseCase: GetStudentLeaderboardUseCase,
  ) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Perfil do Estudante',
    description: 'Retorna o perfil atualizado do estudante logado diretamente do banco de dados.',
  })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso.' })
  getProfile(@Request() req: { user: { id: string } }) {
    return this.getStudentProfileUseCase.execute({ userId: req.user.id });
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Atualizar Perfil',
    description: 'Atualiza o nome completo, email e nome de usuário do estudante.',
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  updateProfile(
    @Request() req: { user: { id: string } },
    @Body(new ZodValidationPipe(updateStudentProfileSchema))
    dto: UpdateStudentProfileDto,
  ) {
    return this.updateStudentProfileUseCase.execute({
      userId: req.user.id,
      fullName: dto.fullName,
      email: dto.email,
      username: dto.username,
    });
  }

  @Patch('password')
  @ApiOperation({
    summary: 'Atualizar Senha',
    description: 'Atualiza a senha do estudante.',
  })
  @ApiResponse({ status: 200, description: 'Senha atualizada com sucesso.' })
  updatePassword(
    @Request() req: { user: { id: string } },
    @Body(new ZodValidationPipe(updateStudentPasswordSchema))
    dto: UpdateStudentPasswordDto,
  ) {
    return this.updateStudentPasswordUseCase.execute({
      userId: req.user.id,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  }

  @Delete('account')
  @ApiOperation({
    summary: 'Excluir Conta',
    description: 'Remove permanentemente a conta do estudante.',
  })
  @ApiResponse({ status: 200, description: 'Conta excluída com sucesso.' })
  deleteAccount(@Request() req: { user: { id: string } }) {
    return this.deleteStudentAccountUseCase.execute({ userId: req.user.id });
  }

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
