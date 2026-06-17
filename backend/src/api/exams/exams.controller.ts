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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  createExamSchema,
  updateExamSchema,
  reorderSchema,
  CreateExamDto,
  UpdateExamDto,
  ReorderDto,
} from './dto/exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { FindAllExamsUseCase } from '../../application/content/use-cases/find-all-exams.use-case';
import { FindExamByIdUseCase } from '../../application/content/use-cases/find-exam-by-id.use-case';
import { FindExamBySlugUseCase } from '../../application/content/use-cases/find-exam-by-slug.use-case';
import { CreateExamUseCase } from '../../application/content/use-cases/create-exam.use-case';
import { UpdateExamUseCase } from '../../application/content/use-cases/update-exam.use-case';
import { DeleteExamUseCase } from '../../application/content/use-cases/delete-exam.use-case';
import { ReorderExamsUseCase } from '../../application/content/use-cases/reorder-exams.use-case';

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
  constructor(
    private readonly findAllExamsUseCase: FindAllExamsUseCase,
    private readonly findExamByIdUseCase: FindExamByIdUseCase,
    private readonly findExamBySlugUseCase: FindExamBySlugUseCase,
    private readonly createExamUseCase: CreateExamUseCase,
    private readonly updateExamUseCase: UpdateExamUseCase,
    private readonly deleteExamUseCase: DeleteExamUseCase,
    private readonly reorderExamsUseCase: ReorderExamsUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar Exame/Trilha', description: 'Cria uma nova trilha principal de estudos (Apenas Admin).' })
  @ApiResponse({ status: 201, description: 'Exame criado com sucesso.' })
  create(
    @Body(new ZodValidationPipe(createExamSchema)) createExamDto: CreateExamDto,
  ) {
    return this.createExamUseCase.execute(createExamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar Exames', description: 'Retorna a lista de todos os exames/trilhas cadastrados.' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll() {
    return this.findAllExamsUseCase.execute();
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Buscar Exame por ID ou Slug', description: 'Retorna os detalhes de um exame específico.' })
  @ApiResponse({ status: 200, description: 'Exame encontrado.' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    const isUuidFormat =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    if (isUuidFormat) {
      return this.findExamByIdUseCase.execute(idOrSlug);
    }
    return this.findExamBySlugUseCase.execute(idOrSlug);
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar Exames', description: 'Atualiza a ordem de exibição dos exames (Apenas Admin).' })
  @ApiResponse({ status: 200, description: 'Ordem atualizada com sucesso.' })
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderExamsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar Exame', description: 'Atualiza os dados de um exame existente (Apenas Admin).' })
  @ApiResponse({ status: 200, description: 'Exame atualizado com sucesso.' })
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
  @ApiOperation({ summary: 'Excluir Exame', description: 'Remove um exame do sistema (Apenas Admin).' })
  @ApiResponse({ status: 200, description: 'Exame removido com sucesso.' })
  remove(@Param('id') id: string) {
    return this.deleteExamUseCase.execute(id);
  }
}
