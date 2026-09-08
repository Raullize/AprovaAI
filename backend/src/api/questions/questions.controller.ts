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
  createQuestionSchema,
  updateQuestionSchema,
  CreateQuestionDto,
  UpdateQuestionDto,
} from './dto/question.dto';
import { reorderSchema, ReorderDto } from '../exams/dto/exam.dto';
import { QuestionResponseDto } from '../content/dto/content-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { FindAllQuestionsUseCase } from '../../application/content/use-cases/find-all-questions.use-case';
import { FindQuestionsBySimulationIdUseCase } from '../../application/content/use-cases/find-questions-by-simulation-id.use-case';
import { FindQuestionByIdUseCase } from '../../application/content/use-cases/find-question-by-id.use-case';
import { CreateQuestionUseCase } from '../../application/content/use-cases/create-question.use-case';
import { UpdateQuestionUseCase } from '../../application/content/use-cases/update-question.use-case';
import { DeleteQuestionUseCase } from '../../application/content/use-cases/delete-question.use-case';
import { ReorderQuestionsUseCase } from '../../application/content/use-cases/reorder-questions.use-case';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly findAllQuestionsUseCase: FindAllQuestionsUseCase,
    private readonly findQuestionsBySimulationIdUseCase: FindQuestionsBySimulationIdUseCase,
    private readonly findQuestionByIdUseCase: FindQuestionByIdUseCase,
    private readonly createQuestionUseCase: CreateQuestionUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionUseCase,
    private readonly deleteQuestionUseCase: DeleteQuestionUseCase,
    private readonly reorderQuestionsUseCase: ReorderQuestionsUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Criar Questão',
    description:
      'Cria uma nova questão para um simulado, com ao menos 2 alternativas. (Somente Admin)',
  })
  @ApiResponse({
    status: 201,
    description: 'Questão criada com sucesso.',
    type: QuestionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (enunciado obrigatório e ao menos 2 opções).',
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  create(
    @Body(new ZodValidationPipe(createQuestionSchema))
    createQuestionDto: CreateQuestionDto,
  ) {
    return this.createQuestionUseCase.execute(createQuestionDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Listar Questões',
    description:
      'Retorna a lista de todas as questões cadastradas. Requer autenticação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de questões retornada com sucesso.',
    type: [QuestionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  findAll() {
    return this.findAllQuestionsUseCase.execute();
  }

  @Get('simulation/:simulationId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Buscar Questões por Simulado',
    description:
      'Retorna todas as questões pertencentes a um simulado específico. Requer autenticação.',
  })
  @ApiParam({
    name: 'simulationId',
    description: 'UUID do simulado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Questões do simulado encontradas.',
    type: [QuestionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  findBySimulation(@Param('simulationId') simulationId: string) {
    return this.findQuestionsBySimulationIdUseCase.execute(simulationId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Buscar Questão por ID',
    description:
      'Retorna os detalhes de uma questão específica. Requer autenticação.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da questão.',
  })
  @ApiResponse({
    status: 200,
    description: 'Questão encontrada.',
    type: QuestionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.findQuestionByIdUseCase.execute(id);
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Reordenar Questões',
    description:
      'Atualiza a ordem de exibição de TODAS as questões de um simulado. ' +
      'O array `ids` deve conter exatamente todos os IDs das questões do simulado. (Somente Admin)',
  })
  @ApiResponse({ status: 200, description: 'Ordem atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Lista de reordenação inválida.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderQuestionsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Atualizar Questão',
    description: 'Atualiza os dados de uma questão existente. (Somente Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da questão a ser atualizada.',
  })
  @ApiResponse({
    status: 200,
    description: 'Questão atualizada com sucesso.',
    type: QuestionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  @ApiResponse({ status: 404, description: 'Questão não encontrada.' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateQuestionSchema))
    updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.updateQuestionUseCase.execute({ id, data: updateQuestionDto });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Excluir Questão',
    description: 'Remove uma questão do sistema. (Somente Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da questão a ser removida.',
  })
  @ApiResponse({ status: 200, description: 'Questão removida com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  @ApiResponse({ status: 404, description: 'Questão não encontrada.' })
  remove(@Param('id') id: string) {
    return this.deleteQuestionUseCase.execute(id);
  }
}
