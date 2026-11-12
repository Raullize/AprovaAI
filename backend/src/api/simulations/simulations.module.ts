import { Module } from '@nestjs/common';
import { SimulationsController } from './simulations.controller';
import { FindAllSimulationsUseCase } from '../../application/content/use-cases/find-all-simulations.use-case';
import { FindSimulationsByTopicIdUseCase } from '../../application/content/use-cases/find-simulations-by-topic-id.use-case';
import { FindSimulationByIdOrSlugUseCase } from '../../application/content/use-cases/find-simulation-by-id-or-slug.use-case';
import { FindSimulationByIdUseCase } from '../../application/content/use-cases/find-simulation-by-id.use-case';
import { FindSimulationBySlugUseCase } from '../../application/content/use-cases/find-simulation-by-slug.use-case';
import { CreateSimulationUseCase } from '../../application/content/use-cases/create-simulation.use-case';
import { UpdateSimulationUseCase } from '../../application/content/use-cases/update-simulation.use-case';
import { DeleteSimulationUseCase } from '../../application/content/use-cases/delete-simulation.use-case';
import { ReorderSimulationsUseCase } from '../../application/content/use-cases/reorder-simulations.use-case';
import { GenerateSimulationUseCase } from '../../application/content/use-cases/generate-simulation.use-case';
import { SimulationRepository } from '../../domain/content/repositories/simulation.repository';
import { PrismaSimulationRepository } from '../../infrastructure/database/prisma/repositories/prisma-simulation.repository';
import { TopicRepository } from '../../domain/content/repositories/topic.repository';
import { PrismaTopicRepository } from '../../infrastructure/database/prisma/repositories/prisma-topic.repository';
import { ExamRepository } from '../../domain/content/repositories/exam.repository';
import { PrismaExamRepository } from '../../infrastructure/database/prisma/repositories/prisma-exam.repository';
import { ContentGenerationRepository } from '../../domain/content/repositories/content-generation.repository';
import { PrismaContentGenerationRepository } from '../../infrastructure/database/prisma/repositories/prisma-content-generation.repository';
import { EnemQuestionBank } from '../../application/content/ports/enem-question-bank';
import { EnemDevQuestionBank } from '../../infrastructure/enem/enem-dev-question-bank';
import { FakeEnemQuestionBank } from '../../infrastructure/enem/fake-enem-question-bank';
import { QuestionGenerator } from '../../application/content/ports/question-generator';
import { GeminiQuestionGenerator } from '../../infrastructure/ai/gemini-question-generator';
import { FakeQuestionGenerator } from '../../infrastructure/ai/fake-question-generator';
import { LlmProvider } from '../../application/ai/ports/llm-provider';
import {
  createLlmProvider,
  getGeminiModelName,
} from '../../infrastructure/ai/llm-provider.factory';

function createEnemQuestionBank(): EnemQuestionBank {
  return process.env.NODE_ENV === 'test'
    ? new FakeEnemQuestionBank()
    : new EnemDevQuestionBank();
}

function createQuestionGenerator(llmProvider: LlmProvider): QuestionGenerator {
  const useFake =
    process.env.NODE_ENV === 'test' ||
    (process.env.AI_PROVIDER ?? '').toLowerCase() === 'fake';

  return useFake
    ? new FakeQuestionGenerator()
    : new GeminiQuestionGenerator({
        llmProvider,
        modelName: getGeminiModelName(),
      });
}

@Module({
  controllers: [SimulationsController],
  providers: [
    FindAllSimulationsUseCase,
    FindSimulationsByTopicIdUseCase,
    FindSimulationByIdOrSlugUseCase,
    FindSimulationByIdUseCase,
    FindSimulationBySlugUseCase,
    CreateSimulationUseCase,
    UpdateSimulationUseCase,
    DeleteSimulationUseCase,
    ReorderSimulationsUseCase,
    GenerateSimulationUseCase,
    {
      provide: SimulationRepository,
      useClass: PrismaSimulationRepository,
    },
    {
      provide: TopicRepository,
      useClass: PrismaTopicRepository,
    },
    {
      provide: ExamRepository,
      useClass: PrismaExamRepository,
    },
    {
      provide: ContentGenerationRepository,
      useClass: PrismaContentGenerationRepository,
    },
    {
      provide: EnemQuestionBank,
      useFactory: createEnemQuestionBank,
    },
    {
      provide: LlmProvider,
      useFactory: createLlmProvider,
    },
    {
      provide: QuestionGenerator,
      useFactory: createQuestionGenerator,
      inject: [LlmProvider],
    },
  ],
})
export class SimulationsModule {}
