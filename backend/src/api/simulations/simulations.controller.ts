import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { StartSimulationUseCase } from '../../application/simulations/use-cases/start-simulation.use-case';
import { SaveAnswerUseCase } from '../../application/simulations/use-cases/save-answer.use-case';
import { FinishSimulationUseCase } from '../../application/simulations/use-cases/finish-simulation.use-case';

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
  ) {}

  @Post('start')
  start(
    @Request() req: any,
    @Body(new ZodValidationPipe(startSimulationSchema))
    dto: StartSimulationDto,
  ) {
    return this.startSimulationUseCase.execute({
      userId: req.user.id,
      levelId: dto.levelId,
    });
  }

  @Post(':id/answers')
  saveAnswer(
    @Request() req: any,
    @Param('id') examResultId: string,
    @Body(new ZodValidationPipe(saveAnswerSchema))
    dto: SaveAnswerDto,
  ) {
    return this.saveAnswerUseCase.execute({
      userId: req.user.id,
      examResultId,
      questionId: dto.questionId,
      selectedOptions: dto.selectedOptions,
      timeSpent: dto.timeSpent,
    });
  }

  @Post(':id/finish')
  finish(
    @Request() req: any,
    @Param('id') examResultId: string,
    @Body(new ZodValidationPipe(finishSimulationSchema))
    dto: FinishSimulationDto,
  ) {
    return this.finishSimulationUseCase.execute({
      userId: req.user.id,
      examResultId,
      timeSpent: dto.timeSpent,
    });
  }
}
