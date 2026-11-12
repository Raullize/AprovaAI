import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { SendChatMessageUseCase } from '../../application/ai/use-cases/send-chat-message.use-case';
import { GetChatHistoryUseCase } from '../../application/ai/use-cases/get-chat-history.use-case';
import { SendAttemptChatMessageUseCase } from '../../application/ai/use-cases/send-attempt-chat-message.use-case';
import { GetAttemptChatHistoryUseCase } from '../../application/ai/use-cases/get-attempt-chat-history.use-case';
import { ClearChatHistoryUseCase } from '../../application/ai/use-cases/clear-chat-history.use-case';
import { ClearAttemptChatHistoryUseCase } from '../../application/ai/use-cases/clear-attempt-chat-history.use-case';
import { AiChatMessageRepository } from '../../domain/ai/repositories/ai-chat-message.repository';
import { PrismaAiChatMessageRepository } from '../../infrastructure/database/prisma/repositories/prisma-ai-chat-message.repository';
import { ExamRepository } from '../../domain/content/repositories/exam.repository';
import { PrismaExamRepository } from '../../infrastructure/database/prisma/repositories/prisma-exam.repository';
import { QuestionRepository } from '../../domain/content/repositories/question.repository';
import { PrismaQuestionRepository } from '../../infrastructure/database/prisma/repositories/prisma-question.repository';
import { SimulationAttemptRepository } from '../../domain/simulations/repositories/simulation-attempt.repository';
import { PrismaSimulationAttemptRepository } from '../../infrastructure/database/prisma/repositories/prisma-simulation-attempt.repository';
import { LlmProvider } from '../../application/ai/ports/llm-provider';
import { createLlmProvider } from '../../infrastructure/ai/llm-provider.factory';

@Module({
  controllers: [AiController],
  providers: [
    SendChatMessageUseCase,
    GetChatHistoryUseCase,
    SendAttemptChatMessageUseCase,
    GetAttemptChatHistoryUseCase,
    ClearChatHistoryUseCase,
    ClearAttemptChatHistoryUseCase,
    {
      provide: AiChatMessageRepository,
      useClass: PrismaAiChatMessageRepository,
    },
    {
      provide: ExamRepository,
      useClass: PrismaExamRepository,
    },
    {
      provide: QuestionRepository,
      useClass: PrismaQuestionRepository,
    },
    {
      provide: SimulationAttemptRepository,
      useClass: PrismaSimulationAttemptRepository,
    },
    {
      provide: LlmProvider,
      useFactory: createLlmProvider,
    },
  ],
})
export class AiModule {}
