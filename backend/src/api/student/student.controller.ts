import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRepository } from '../../domain/users/repositories/user.repository';
import { HashProvider } from '../../application/auth/ports/hash-provider';
import { Email } from '../../domain/users/value-objects/email';

@ApiTags('Student')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student')
export class StudentController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashProvider: HashProvider,
  ) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Perfil do Estudante',
    description: 'Retorna o perfil atualizado do estudante logado diretamente do banco de dados.',
  })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso.' })
  async getProfile(@Request() req: { user: { id: string } }) {
    const user = await this.userRepository.findById(req.user.id);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email.value,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      xp: user.xp,
      streakCount: user.streakCount,
      lastActiveAt: user.lastActiveAt,
    };
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Atualizar Perfil',
    description: 'Atualiza o nome completo, email e nome de usuário do estudante.',
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() dto: { fullName?: string; email?: string; username?: string },
  ) {
    const user = await this.userRepository.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (dto.username && dto.username !== user.username) {
      const existingUser = await this.userRepository.findByUsername(dto.username);
      if (existingUser) {
        throw new BadRequestException('Nome de usuário já está em uso.');
      }
      user.changeUsername(dto.username);
    }

    if (dto.email && dto.email !== user.email.value) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException('E-mail já está em uso.');
      }
      user.changeEmail(Email.create(dto.email));
    }

    if (dto.fullName) {
      user.changeFullName(dto.fullName);
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email.value,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      xp: user.xp,
      streakCount: user.streakCount,
      lastActiveAt: user.lastActiveAt,
    };
  }

  @Patch('password')
  @ApiOperation({
    summary: 'Atualizar Senha',
    description: 'Atualiza a senha do estudante.',
  })
  @ApiResponse({ status: 200, description: 'Senha atualizada com sucesso.' })
  async updatePassword(
    @Request() req: { user: { id: string } },
    @Body() dto: { currentPassword?: string; newPassword?: string },
  ) {
    if (!dto.currentPassword || !dto.newPassword) {
      throw new BadRequestException('Senha atual e nova senha são obrigatórias.');
    }

    const user = await this.userRepository.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await this.hashProvider.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Senha atual incorreta.');
    }

    const newPasswordHash = await this.hashProvider.hash(dto.newPassword);
    user.changePassword(newPasswordHash);

    await this.userRepository.save(user);

    return { message: 'Senha atualizada com sucesso.' };
  }

  @Delete('account')
  @ApiOperation({
    summary: 'Excluir Conta',
    description: 'Remove permanentemente a conta do estudante.',
  })
  @ApiResponse({ status: 200, description: 'Conta excluída com sucesso.' })
  async deleteAccount(@Request() req: { user: { id: string } }) {
    const user = await this.userRepository.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.userRepository.delete(user.id);

    return { message: 'Conta excluída com sucesso.' };
  }

  @Get('dashboard-stats')
  @ApiOperation({
    summary: 'Estatísticas do Painel',
    description: 'Retorna a ofensiva (streak) e as datas de atividade no mês atual.',
  })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso.' })
  async getDashboardStats(@Request() req: { user: { id: string } }) {
    const user = await this.userRepository.findById(req.user.id);
    if (!user) {
      return { streakCount: 0, activeDays: [] };
    }

    const today = new Date();
    const activeDates = await this.userRepository.findActivitiesByUserIdAndMonth(
      user.id,
      today,
    );

    const activeDays = activeDates.map((date) => date.getDate());

    return {
      streakCount: user.streakCount,
      activeDays,
    };
  }

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Ranking de Líderes',
    description: 'Retorna os top 10 estudantes com mais XP.',
  })
  @ApiResponse({ status: 200, description: 'Ranking retornado com sucesso.' })
  async getLeaderboard() {
    const users = await this.userRepository.findLeaderboard(10);
    return users.map((u, index) => ({
      rank: index + 1,
      fullName: u.fullName,
      username: u.username,
      xp: u.xp,
    }));
  }
}
