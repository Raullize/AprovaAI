import { Logger } from '@nestjs/common';
import { LlmProvider } from '../../application/ai/ports/llm-provider';
import { FakeLlmProvider } from './fake-llm.provider';
import { GeminiLlmProvider } from './gemini-llm.provider';

const logger = new Logger('LlmProviderFactory');

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const DEFAULT_MAX_OUTPUT_TOKENS = 500;

function parseMaxOutputTokens(value?: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_OUTPUT_TOKENS;
}

export function createLlmProvider(): LlmProvider {
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

export function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}
