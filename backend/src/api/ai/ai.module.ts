import { Logger, Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { SendChatMessageUseCase } from '../../application/ai/use-cases/send-chat-message.use-case';
import { GetChatHistoryUseCase } from '../../application/ai/use-cases/get-chat-history.use-case';
import { AiChatMessageRepository } from '../../domain/ai/repositories/ai-chat-message.repository';
import { PrismaAiChatMessageRepository } from '../../infrastructure/database/prisma/repositories/prisma-ai-chat-message.repository';
import { ExamRepository } from '../../domain/content/repositories/exam.repository';
import { PrismaExamRepository } from '../../infrastructure/database/prisma/repositories/prisma-exam.repository';
import { LlmProvider } from '../../application/ai/ports/llm-provider';
import { GeminiLlmProvider } from '../../infrastructure/ai/gemini-llm.provider';
import { FakeLlmProvider } from '../../infrastructure/ai/fake-llm.provider';

const logger = new Logger('AiModule');

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const DEFAULT_MAX_OUTPUT_TOKENS = 500;

function parseMaxOutputTokens(value?: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_OUTPUT_TOKENS;
}

function createLlmProvider(): LlmProvider {
  const provider = (process.env.AI_PROVIDER ?? '').toLowerCase();
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const maxOutputTokens = parseMaxOutputTokens(
    process.env.AI_MAX_OUTPUT_TOKENS,
  );

  // Em testes, nunca chamamos o Gemini (determinismo e custo).
  if (process.env.NODE_ENV === 'test') {
    return new FakeLlmProvider();
  }

  if (provider === 'fake' || !apiKey) {
    if (provider !== 'fake') {
      logger.warn(
        'GEMINI_API_KEY não configurada; usando FakeLlmProvider (respostas de demonstração).',
      );
    }
    return new FakeLlmProvider();
  }

  logger.log(`Usando Gemini (modelo: ${model}).`);
  return new GeminiLlmProvider({ apiKey, model, maxOutputTokens });
}

@Module({
  controllers: [AiController],
  providers: [
    SendChatMessageUseCase,
    GetChatHistoryUseCase,
    {
      provide: AiChatMessageRepository,
      useClass: PrismaAiChatMessageRepository,
    },
    {
      provide: ExamRepository,
      useClass: PrismaExamRepository,
    },
    {
      provide: LlmProvider,
      useFactory: createLlmProvider,
    },
  ],
})
export class AiModule {}
