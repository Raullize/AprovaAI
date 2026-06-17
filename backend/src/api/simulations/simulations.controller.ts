import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { StartSimulationUseCase } from '../../application/simulations/use-cases/start-simulation.use-case';
import { SaveAnswerUseCase } from '../../application/simulations/use-cases/save-answer.use-case';
import { FinishSimulationUseCase } from '../../application/simulations/use-cases/finish-simulation.use-case';
import { GetSimulationHistoryUseCase } from '../../application/simulations/use-cases/get-simulation-history.use-case';

import {
  startSimulationSchema,
  saveAnswerSchema,
  finishSimulationSchema,
  StartSimulationDto,
  SaveAnswerDto,
  FinishSimulationDto,
} from './dto/simulation.dto';

@ApiTags('Simulations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('simulations')
export class SimulationsController {
  constructor(
    private readonly startSimulationUseCase: StartSimulationUseCase,
    private readonly saveAnswerUseCase: SaveAnswerUseCase,
    private readonly finishSimulationUseCase: FinishSimulationUseCase,
    private readonly getSimulationHistoryUseCase: GetSimulationHistoryUseCase,
  ) {}

  @Get('history')
  @ApiOperation({
    summary: 'Histórico de Simulados',
    description:
      'Retorna a lista de todos os simulados (em andamento ou concluídos) do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso.' })
  getHistory(@Request() req: { user: { id: string } }) {
    return this.getSimulationHistoryUseCase.execute({
      userId: req.user.id,
    });
  }

  @Post('start')
  @ApiOperation({
    summary: 'Iniciar um Simulado',
    description:
      'Inicia um novo simulado para o nível especificado ou retoma um simulado em andamento.',
  })
  @ApiResponse({ status: 201, description: 'Simulado iniciado com sucesso.' })
  start(
    @Request() req: { user: { id: string } },
    @Body(new ZodValidationPipe(startSimulationSchema))
    dto: StartSimulationDto,
  ) {
    return this.startSimulationUseCase.execute({
      userId: req.user.id,
      levelId: dto.levelId,
    });
  }

  @Post(':id/answers')
  @ApiOperation({
    summary: 'Salvar Resposta',
    description:
      'Salva a resposta selecionada pelo aluno para uma questão específica durante o simulado.',
  })
  @ApiResponse({ status: 201, description: 'Resposta salva com sucesso.' })
  saveAnswer(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body(new ZodValidationPipe(saveAnswerSchema))
    dto: SaveAnswerDto,
  ) {
    return this.saveAnswerUseCase.execute({
      userId: req.user.id,
      examResultId: id,
      questionId: dto.questionId,
      selectedOptions: dto.selectedOptions,
      timeSpent: dto.timeSpent,
      isFlaggedForReview: dto.isFlaggedForReview,
    });
  }

  @Post(':id/finish')
  @ApiOperation({
    summary: 'Finalizar Simulado',
    description:
      'Finaliza o simulado, calcula a nota final e define se o aluno foi aprovado ou reprovado.',
  })
  @ApiResponse({ status: 201, description: 'Simulado finalizado com sucesso.' })
  finish(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body(new ZodValidationPipe(finishSimulationSchema))
    dto: FinishSimulationDto,
  ) {
    return this.finishSimulationUseCase.execute({
      userId: req.user.id,
      examResultId: id,
      timeSpent: dto.timeSpent,
    });
  }
}
