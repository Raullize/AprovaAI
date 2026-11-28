import { Logger, Module } from '@nestjs/common';
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
import { EnemQuestionCache } from '../../application/content/ports/enem-question-cache';
import { RateLimiter } from '../../application/content/ports/rate-limiter';
import { EnemDevQuestionBank } from '../../infrastructure/enem/enem-dev-question-bank';
import { FakeEnemQuestionBank } from '../../infrastructure/enem/fake-enem-question-bank';
import { InMemoryEnemQuestionCache } from '../../infrastructure/enem/cache/in-memory-enem-question-cache';
import { RedisEnemQuestionCache } from '../../infrastructure/enem/cache/redis-enem-question-cache';
import { InMemoryRateLimiter } from '../../infrastructure/enem/rate-limit/in-memory-rate-limiter';
import { RedisRateLimiter } from '../../infrastructure/enem/rate-limit/redis-rate-limiter';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { RedisStore } from '../../infrastructure/redis/redis-store';
import { QuestionGenerator } from '../../application/content/ports/question-generator';
import { GeminiQuestionGenerator } from '../../infrastructure/ai/gemini-question-generator';
import { FakeQuestionGenerator } from '../../infrastructure/ai/fake-question-generator';
import { LlmProvider } from '../../application/ai/ports/llm-provider';
import {
  createLlmProvider,
  getGeminiModelName,
} from '../../infrastructure/ai/llm-provider.factory';

const logger = new Logger('EnemCache');
let warnedMissingRedisUrl = false;

function shouldUseRedis(): boolean {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }

  const driver = (process.env.CACHE_DRIVER ?? 'memory').trim().toLowerCase();

  if (driver !== 'redis') {
    return false;
  }

  if (!process.env.REDIS_URL?.trim()) {
    if (!warnedMissingRedisUrl) {
      warnedMissingRedisUrl = true;
      logger.warn(
        'CACHE_DRIVER=redis sem REDIS_URL definida; usando fallback em memória.',
      );
    }

    return false;
  }

  return true;
}

function createEnemQuestionCache(store: RedisStore): EnemQuestionCache {
  if (!shouldUseRedis()) {
    return new InMemoryEnemQuestionCache();
  }

  return new RedisEnemQuestionCache(store, new InMemoryEnemQuestionCache());
}

function createRateLimiter(store: RedisStore): RateLimiter {
  if (!shouldUseRedis()) {
    return new InMemoryRateLimiter();
  }

  return new RedisRateLimiter(store, new InMemoryRateLimiter());
}

function createEnemQuestionBank(
  cache: EnemQuestionCache,
  rateLimiter: RateLimiter,
): EnemQuestionBank {
  return process.env.NODE_ENV === 'test'
    ? new FakeEnemQuestionBank()
    : new EnemDevQuestionBank({ cache, rateLimiter });
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
  imports: [RedisModule],
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
      provide: EnemQuestionCache,
      useFactory: createEnemQuestionCache,
      inject: [RedisStore],
    },
    {
      provide: RateLimiter,
      useFactory: createRateLimiter,
      inject: [RedisStore],
    },
    {
      provide: EnemQuestionBank,
      useFactory: createEnemQuestionBank,
      inject: [EnemQuestionCache, RateLimiter],
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
