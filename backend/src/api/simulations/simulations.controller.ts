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
  createSimulationSchema,
  updateSimulationSchema,
  CreateSimulationDto,
  UpdateSimulationDto,
} from './dto/simulation.dto';
import { reorderSchema, ReorderDto } from '../exams/dto/exam.dto';
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
  @ApiOperation({ summary: 'Criar Nível', description: 'Cria um novo nível/simulado (Apenas Admin).' })
  @ApiResponse({ status: 201, description: 'Nível criado com sucesso.' })
  create(
    @Body(new ZodValidationPipe(createSimulationSchema))
    createSimulationDto: CreateSimulationDto,
  ) {
    return this.createSimulationUseCase.execute(createSimulationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar Níveis', description: 'Retorna a lista de todos os níveis cadastrados.' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll() {
    return this.findAllSimulationsUseCase.execute();
  }

  @Get('topic/:topicId')
  @ApiOperation({ summary: 'Buscar Níveis por Tópico', description: 'Retorna todos os níveis pertencentes a um tópico específico.' })
  @ApiResponse({ status: 200, description: 'Níveis encontrados.' })
  findByTopic(@Param('topicId') topicId: string) {
    return this.findSimulationsByTopicIdUseCase.execute(topicId);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Buscar Nível por ID ou Slug', description: 'Retorna os detalhes de um nível específico.' })
  @ApiResponse({ status: 200, description: 'Nível encontrado.' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.findSimulationByIdOrSlugUseCase.execute(idOrSlug);
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar Níveis', description: 'Atualiza a ordem de exibição dos níveis (Apenas Admin).' })
  @ApiResponse({ status: 200, description: 'Ordem atualizada com sucesso.' })
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderSimulationsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar Nível', description: 'Atualiza os dados de um nível existente (Apenas Admin).' })
  @ApiResponse({ status: 200, description: 'Nível atualizado com sucesso.' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSimulationSchema))
    updateSimulationDto: UpdateSimulationDto,
  ) {
    return this.updateSimulationUseCase.execute({ id, data: updateSimulationDto });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir Nível', description: 'Remove um nível do sistema (Apenas Admin).' })
  @ApiResponse({ status: 200, description: 'Nível removido com sucesso.' })
  remove(@Param('id') id: string) {
    return this.deleteSimulationUseCase.execute(id);
  }
}
