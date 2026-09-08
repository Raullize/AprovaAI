import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import {
  createExamSchema,
  updateExamSchema,
  reorderSchema,
  CreateExamDto,
  UpdateExamDto,
  ReorderDto,
} from './dto/exam.dto';
import { ExamResponseDto } from '../content/dto/content-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { FindAllExamsUseCase } from '../../application/content/use-cases/find-all-exams.use-case';
import { FindExamByIdOrSlugUseCase } from '../../application/content/use-cases/find-exam-by-id-or-slug.use-case';
import { CreateExamUseCase } from '../../application/content/use-cases/create-exam.use-case';
import { UpdateExamUseCase } from '../../application/content/use-cases/update-exam.use-case';
import { DeleteExamUseCase } from '../../application/content/use-cases/delete-exam.use-case';
import { ReorderExamsUseCase } from '../../application/content/use-cases/reorder-exams.use-case';

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
  constructor(
    private readonly findAllExamsUseCase: FindAllExamsUseCase,
    private readonly findExamByIdOrSlugUseCase: FindExamByIdOrSlugUseCase,
    private readonly createExamUseCase: CreateExamUseCase,
    private readonly updateExamUseCase: UpdateExamUseCase,
    private readonly deleteExamUseCase: DeleteExamUseCase,
    private readonly reorderExamsUseCase: ReorderExamsUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Criar Exame/Trilha',
    description:
      'Cria uma nova trilha principal de estudos. O slug é gerado ' +
      'automaticamente a partir do nome. (Somente Admin)',
  })
  @ApiResponse({
    status: 201,
    description: 'Exame criado com sucesso.',
    type: ExamResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  create(
    @Body(new ZodValidationPipe(createExamSchema)) createExamDto: CreateExamDto,
  ) {
    return this.createExamUseCase.execute(createExamDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar Exames',
    description: 'Retorna a lista de todos os exames/trilhas cadastrados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de exames retornada com sucesso.',
    type: [ExamResponseDto],
  })
  findAll() {
    return this.findAllExamsUseCase.execute();
  }

  @Get(':idOrSlug')
  @ApiOperation({
    summary: 'Buscar Exame por ID ou Slug',
    description: 'Retorna os detalhes de um exame específico.',
  })
  @ApiParam({
    name: 'idOrSlug',
    description: 'UUID do exame ou seu slug único.',
    example: 'aws-cloud-practitioner',
  })
  @ApiResponse({
    status: 200,
    description: 'Exame encontrado.',
    type: ExamResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exame não encontrado.' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.findExamByIdOrSlugUseCase.execute(idOrSlug);
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Reordenar Exames',
    description:
      'Atualiza a ordem de exibição de TODOS os exames. O array `ids` deve ' +
      'conter exatamente todos os IDs dos exames na nova sequência. (Somente Admin)',
  })
  @ApiResponse({ status: 200, description: 'Ordem atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Lista de reordenação inválida.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderExamsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Atualizar Exame',
    description: 'Atualiza os dados de um exame existente. (Somente Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do exame a ser atualizado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Exame atualizado com sucesso.',
    type: ExamResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  @ApiResponse({ status: 404, description: 'Exame não encontrado.' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExamSchema)) updateExamDto: UpdateExamDto,
  ) {
    return this.updateExamUseCase.execute({ id, data: updateExamDto });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Excluir Exame',
    description: 'Remove um exame do sistema. (Somente Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do exame a ser removido.',
  })
  @ApiResponse({ status: 200, description: 'Exame removido com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  @ApiResponse({ status: 404, description: 'Exame não encontrado.' })
  remove(@Param('id') id: string) {
    return this.deleteExamUseCase.execute(id);
  }
}
