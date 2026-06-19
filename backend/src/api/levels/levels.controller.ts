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
  createLevelSchema,
  updateLevelSchema,
  CreateLevelDto,
  UpdateLevelDto,
} from './dto/level.dto';
import { reorderSchema, ReorderDto } from '../exams/dto/exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { FindAllLevelsUseCase } from '../../application/content/use-cases/find-all-levels.use-case';
import { FindLevelsByTopicIdUseCase } from '../../application/content/use-cases/find-levels-by-topic-id.use-case';
import { FindLevelByIdOrSlugUseCase } from '../../application/content/use-cases/find-level-by-id-or-slug.use-case';
import { CreateLevelUseCase } from '../../application/content/use-cases/create-level.use-case';
import { UpdateLevelUseCase } from '../../application/content/use-cases/update-level.use-case';
import { DeleteLevelUseCase } from '../../application/content/use-cases/delete-level.use-case';
import { ReorderLevelsUseCase } from '../../application/content/use-cases/reorder-levels.use-case';

@ApiTags('Levels')
@Controller('levels')
export class LevelsController {
  constructor(
    private readonly findAllLevelsUseCase: FindAllLevelsUseCase,
    private readonly findLevelsByTopicIdUseCase: FindLevelsByTopicIdUseCase,
    private readonly findLevelByIdOrSlugUseCase: FindLevelByIdOrSlugUseCase,
    private readonly createLevelUseCase: CreateLevelUseCase,
    private readonly updateLevelUseCase: UpdateLevelUseCase,
    private readonly deleteLevelUseCase: DeleteLevelUseCase,
    private readonly reorderLevelsUseCase: ReorderLevelsUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar Nível', description: 'Cria um novo nível/simulado (Apenas Admin).' })
  @ApiResponse({ status: 201, description: 'Nível criado com sucesso.' })
  create(
    @Body(new ZodValidationPipe(createLevelSchema))
    createLevelDto: CreateLevelDto,
  ) {
    return this.createLevelUseCase.execute(createLevelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar Níveis', description: 'Retorna a lista de todos os níveis cadastrados.' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll() {
    return this.findAllLevelsUseCase.execute();
  }

  @Get('topic/:topicId')
  @ApiOperation({ summary: 'Buscar Níveis por Tópico', description: 'Retorna todos os níveis pertencentes a um tópico específico.' })
  @ApiResponse({ status: 200, description: 'Níveis encontrados.' })
  findByTopic(@Param('topicId') topicId: string) {
    return this.findLevelsByTopicIdUseCase.execute(topicId);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Buscar Nível por ID ou Slug', description: 'Retorna os detalhes de um nível específico.' })
  @ApiResponse({ status: 200, description: 'Nível encontrado.' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.findLevelByIdOrSlugUseCase.execute(idOrSlug);
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar Níveis', description: 'Atualiza a ordem de exibição dos níveis (Apenas Admin).' })
  @ApiResponse({ status: 200, description: 'Ordem atualizada com sucesso.' })
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderLevelsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar Nível', description: 'Atualiza os dados de um nível existente (Apenas Admin).' })
  @ApiResponse({ status: 200, description: 'Nível atualizado com sucesso.' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLevelSchema))
    updateLevelDto: UpdateLevelDto,
  ) {
    return this.updateLevelUseCase.execute({ id, data: updateLevelDto });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Excluir Nível', description: 'Remove um nível do sistema (Apenas Admin).' })
  @ApiResponse({ status: 200, description: 'Nível removido com sucesso.' })
  remove(@Param('id') id: string) {
    return this.deleteLevelUseCase.execute(id);
  }
}
