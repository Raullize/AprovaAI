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
  createSimulationSchema,
  updateSimulationSchema,
  CreateSimulationDto,
  UpdateSimulationDto,
} from './dto/simulation.dto';
import { reorderSchema, ReorderDto } from '../exams/dto/exam.dto';
import { SimulationResponseDto } from '../content/dto/content-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { FindAllSimulationsUseCase } from '../../application/content/use-cases/find-all-simulations.use-case';
import { FindSimulationsByTopicIdUseCase } from '../../application/content/use-cases/find-simulations-by-topic-id.use-case';
import { FindSimulationByIdOrSlugUseCase } from '../../application/content/use-cases/find-simulation-by-id-or-slug.use-case';
import { CreateSimulationUseCase } from '../../application/content/use-cases/create-simulation.use-case';
import { UpdateSimulationUseCase } from '../../application/content/use-cases/update-simulation.use-case';
import { DeleteSimulationUseCase } from '../../application/content/use-cases/delete-simulation.use-case';
import { ReorderSimulationsUseCase } from '../../application/content/use-cases/reorder-simulations.use-case';

@ApiTags('Simulations')
@Controller('simulations')
export class SimulationsController {
  constructor(
    private readonly findAllSimulationsUseCase: FindAllSimulationsUseCase,
    private readonly findSimulationsByTopicIdUseCase: FindSimulationsByTopicIdUseCase,
    private readonly findSimulationByIdOrSlugUseCase: FindSimulationByIdOrSlugUseCase,
    private readonly createSimulationUseCase: CreateSimulationUseCase,
    private readonly updateSimulationUseCase: UpdateSimulationUseCase,
    private readonly deleteSimulationUseCase: DeleteSimulationUseCase,
    private readonly reorderSimulationsUseCase: ReorderSimulationsUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Criar Simulado',
    description:
      'Cria um novo simulado vinculado a um tópico. O slug é gerado ' +
      'automaticamente. (Somente Admin)',
  })
  @ApiResponse({
    status: 201,
    description: 'Simulado criado com sucesso.',
    type: SimulationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  create(
    @Body(new ZodValidationPipe(createSimulationSchema))
    createSimulationDto: CreateSimulationDto,
  ) {
    return this.createSimulationUseCase.execute(createSimulationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar Simulados',
    description: 'Retorna a lista de todos os simulados cadastrados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de simulados retornada com sucesso.',
    type: [SimulationResponseDto],
  })
  findAll() {
    return this.findAllSimulationsUseCase.execute();
  }

  @Get('topic/:topicId')
  @ApiOperation({
    summary: 'Buscar Simulados por Tópico',
    description:
      'Retorna todos os simulados pertencentes a um tópico específico.',
  })
  @ApiParam({
    name: 'topicId',
    description: 'UUID do tópico.',
  })
  @ApiResponse({
    status: 200,
    description: 'Simulados do tópico encontrados.',
    type: [SimulationResponseDto],
  })
  findByTopic(@Param('topicId') topicId: string) {
    return this.findSimulationsByTopicIdUseCase.execute(topicId);
  }

  @Get(':idOrSlug')
  @ApiOperation({
    summary: 'Buscar Simulado por ID ou Slug',
    description: 'Retorna os detalhes de um simulado específico.',
  })
  @ApiParam({
    name: 'idOrSlug',
    description: 'UUID do simulado ou seu slug único.',
  })
  @ApiResponse({
    status: 200,
    description: 'Simulado encontrado.',
    type: SimulationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Simulado não encontrado.' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.findSimulationByIdOrSlugUseCase.execute(idOrSlug);
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Reordenar Simulados',
    description:
      'Atualiza a ordem de exibição de TODOS os simulados de um tópico. O ' +
      'array `ids` deve conter exatamente todos os IDs dos simulados do tópico. (Somente Admin)',
  })
  @ApiResponse({ status: 200, description: 'Ordem atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Lista de reordenação inválida.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderSimulationsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Atualizar Simulado',
    description: 'Atualiza os dados de um simulado existente. (Somente Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do simulado a ser atualizado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Simulado atualizado com sucesso.',
    type: SimulationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  @ApiResponse({ status: 404, description: 'Simulado não encontrado.' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSimulationSchema))
    updateSimulationDto: UpdateSimulationDto,
  ) {
    return this.updateSimulationUseCase.execute({
      id,
      data: updateSimulationDto,
    });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Excluir Simulado',
    description: 'Remove um simulado do sistema. (Somente Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID do simulado a ser removido.',
  })
  @ApiResponse({ status: 200, description: 'Simulado removido com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  @ApiResponse({ status: 404, description: 'Simulado não encontrado.' })
  remove(@Param('id') id: string) {
    return this.deleteSimulationUseCase.execute(id);
  }
}
