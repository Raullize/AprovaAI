import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import {
  createTopicSchema,
  updateTopicSchema,
  CreateTopicDto,
  UpdateTopicDto,
} from './dto/topic.dto';
import { reorderSchema, ReorderDto } from '../exams/dto/exam.dto';
import { TopicResponseDto } from '../content/dto/content-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { FindAllTopicsUseCase } from '../../application/content/use-cases/find-all-topics.use-case';
import { FindTopicsByExamIdUseCase } from '../../application/content/use-cases/find-topics-by-exam-id.use-case';
import { FindTopicByIdOrSlugUseCase } from '../../application/content/use-cases/find-topic-by-id-or-slug.use-case';
import { CreateTopicUseCase } from '../../application/content/use-cases/create-topic.use-case';
import { UpdateTopicUseCase } from '../../application/content/use-cases/update-topic.use-case';
import { DeleteTopicUseCase } from '../../application/content/use-cases/delete-topic.use-case';
import { ReorderTopicsUseCase } from '../../application/content/use-cases/reorder-topics.use-case';

@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  constructor(
    private readonly findAllTopicsUseCase: FindAllTopicsUseCase,
    private readonly findTopicsByExamIdUseCase: FindTopicsByExamIdUseCase,
    private readonly findTopicByIdOrSlugUseCase: FindTopicByIdOrSlugUseCase,
    private readonly createTopicUseCase: CreateTopicUseCase,
    private readonly updateTopicUseCase: UpdateTopicUseCase,
    private readonly deleteTopicUseCase: DeleteTopicUseCase,
    private readonly reorderTopicsUseCase: ReorderTopicsUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Criar Tópico',
    description:
      'Cria uma nova disciplina/tópico vinculada a um exame. O slug é ' +
      'gerado automaticamente. (Somente Admin)',
  })
  @ApiResponse({
    status: 201,
    description: 'Tópico criado com sucesso.',
    type: TopicResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  create(
    @Body(new ZodValidationPipe(createTopicSchema))
    createTopicDto: CreateTopicDto,
  ) {
    return this.createTopicUseCase.execute(createTopicDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Listar Tópicos',
    description:
      'Retorna a lista de tópicos. Estudantes veem apenas os publicados; administradores veem todos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tópicos retornada com sucesso.',
    type: [TopicResponseDto],
  })
  findAll(@Request() req: { user?: { role?: string } }) {
    return this.findAllTopicsUseCase.execute({
      includeDraft: req.user?.role === UserRole.ADMIN,
    });
  }

  @Get('exam/:examId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Buscar Tópicos por Exame',
    description:
      'Retorna os tópicos de um exame. Estudantes veem apenas publicados; administradores veem todos.',
  })
  @ApiParam({
    name: 'examId',
    description: 'UUID do exame.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tópicos do exame encontrados.',
    type: [TopicResponseDto],
  })
  findByExam(
    @Param('examId') examId: string,
    @Request() req: { user?: { role?: string } },
  ) {
    return this.findTopicsByExamIdUseCase.execute({
      examId,
      options: { includeDraft: req.user?.role === UserRole.ADMIN },
    });
  }

  @Get(':idOrSlug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Buscar Tópico por ID ou Slug',
    description:
      'Retorna os detalhes de um tópico. Estudantes só acessam publicados; administradores acessam qualquer status.',
  })
  @ApiParam({
    name: 'idOrSlug',
    description: 'UUID do tópico ou seu slug único.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tópico encontrado.',
    type: TopicResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tópico não encontrado.' })
  findOne(
    @Param('idOrSlug') idOrSlug: string,
    @Request() req: { user?: { role?: string } },
  ) {
    return this.findTopicByIdOrSlugUseCase.execute({
      idOrSlug,
      options: { includeDraft: req.user?.role === UserRole.ADMIN },
    });
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Reordenar Tópicos',
    description:
      'Atualiza a ordem de exibição de TODOS os tópicos de um exame. O ' +
      'array `ids` deve conter exatamente todos os IDs dos tópicos do exame. (Somente Admin)',
  })
  @ApiResponse({ status: 200, description: 'Ordem atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Lista de reordenação inválida.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderTopicsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Atualizar Tópico',
    description: 'Atualiza os dados de um tópico existente. (Somente Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do tópico a ser atualizado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tópico atualizado com sucesso.',
    type: TopicResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  @ApiResponse({ status: 404, description: 'Tópico não encontrado.' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTopicSchema))
    updateTopicDto: UpdateTopicDto,
  ) {
    return this.updateTopicUseCase.execute({ id, data: updateTopicDto });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Excluir Tópico',
    description: 'Remove um tópico do sistema. (Somente Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do tópico a ser removido.',
  })
  @ApiResponse({ status: 200, description: 'Tópico removido com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  @ApiResponse({ status: 404, description: 'Tópico não encontrado.' })
  remove(@Param('id') id: string) {
    return this.deleteTopicUseCase.execute(id);
  }
}
