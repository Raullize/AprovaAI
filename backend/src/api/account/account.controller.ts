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
  updateAccountPasswordSchema,
  updateAccountProfileSchema,
  UpdateAccountPasswordDto,
  UpdateAccountProfileDto,
} from './dto/account.dto';
import { GetAccountProfileUseCase } from '../../application/account/use-cases/get-account-profile.use-case';
import { UpdateAccountProfileUseCase } from '../../application/account/use-cases/update-account-profile.use-case';
import { UpdateAccountPasswordUseCase } from '../../application/account/use-cases/update-account-password.use-case';
import { DeleteAccountUseCase } from '../../application/account/use-cases/delete-account.use-case';

@ApiTags('Account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
  constructor(
    private readonly getAccountProfileUseCase: GetAccountProfileUseCase,
    private readonly updateAccountProfileUseCase: UpdateAccountProfileUseCase,
    private readonly updateAccountPasswordUseCase: UpdateAccountPasswordUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
  ) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Perfil da Conta',
    description:
      'Retorna o perfil atualizado do usuário autenticado, independentemente do papel.',
  })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso.' })
  getProfile(@Request() req: { user: { id: string } }) {
    return this.getAccountProfileUseCase.execute({ userId: req.user.id });
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Atualizar Perfil',
    description:
      'Atualiza o nome completo, o e-mail e o nome de usuário da própria conta.',
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  updateProfile(
    @Request() req: { user: { id: string } },
    @Body(new ZodValidationPipe(updateAccountProfileSchema))
    dto: UpdateAccountProfileDto,
  ) {
    return this.updateAccountProfileUseCase.execute({
      userId: req.user.id,
      fullName: dto.fullName,
      email: dto.email,
      username: dto.username,
      avatarUrl: dto.avatarUrl,
    });
  }

  @Patch('password')
  @ApiOperation({
    summary: 'Atualizar Senha',
    description: 'Atualiza a senha da própria conta.',
  })
  @ApiResponse({ status: 200, description: 'Senha atualizada com sucesso.' })
  updatePassword(
    @Request() req: { user: { id: string } },
    @Body(new ZodValidationPipe(updateAccountPasswordSchema))
    dto: UpdateAccountPasswordDto,
  ) {
    return this.updateAccountPasswordUseCase.execute({
      userId: req.user.id,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  }

  @Delete()
  @ApiOperation({
    summary: 'Excluir Conta',
    description:
      'Remove permanentemente a própria conta do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Conta excluída com sucesso.' })
  deleteAccount(@Request() req: { user: { id: string } }) {
    return this.deleteAccountUseCase.execute({ userId: req.user.id });
  }
}
