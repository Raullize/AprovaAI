import { Logger } from '@nestjs/common';
import { EnemQuestionCache } from '../../../application/content/ports/enem-question-cache';
import { EnemQuestion } from '../../../application/content/ports/enem-question-bank';
import { RedisStore } from '../../redis/redis-store';

const WARNING_COOLDOWN_MS = 30_000;

/**
 * Cache compartilhado no Redis.
 *
 * O fallback em memória é mantido em paralelo para que uma queda do Redis
 * não interrompa a geração do simulado: leituras usam o fallback quando o
 * Redis falha e escritas são espelhadas localmente.
 */
export class RedisEnemQuestionCache extends EnemQuestionCache {
  private readonly logger = new Logger(RedisEnemQuestionCache.name);
  private lastWarningAt = 0;

  constructor(
    private readonly store: RedisStore,
    private readonly fallback: EnemQuestionCache,
    private readonly now: () => number = () => Date.now(),
  ) {
    super();
  }

  async get(key: string): Promise<EnemQuestion[] | null> {
    try {
      const raw = await this.store.get(key);

      if (raw === null) {
        return null;
      }

      const parsed = this.parse(raw);

      if (!parsed) {
        this.warn(`Cache Redis com conteúdo inválido na chave ${key}.`);
        await this.store.del(key).catch(() => undefined);
      }

      return parsed;
    } catch (error) {
      this.warn(
        `Falha ao ler o cache Redis; usando fallback local. ${this.describe(
          error,
        )}`,
      );
      return this.readFallback(key);
    }
  }

  async set(
    key: string,
    questions: EnemQuestion[],
    ttlMs: number,
  ): Promise<void> {
    try {
      await this.store.set(key, JSON.stringify(questions), ttlMs);
    } catch (error) {
      this.warn(
        `Falha ao gravar o cache Redis; mantendo fallback local. ${this.describe(
          error,
        )}`,
      );
    }

    try {
      await this.fallback.set(key, questions, ttlMs);
    } catch {
      // O cache nunca deve derrubar a geração do simulado.
    }
  }

  private parse(raw: string): EnemQuestion[] | null {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as EnemQuestion[]) : null;
    } catch {
      return null;
    }
  }

  private async readFallback(key: string): Promise<EnemQuestion[] | null> {
    try {
      return await this.fallback.get(key);
    } catch {
      return null;
    }
  }

  private warn(message: string): void {
    const now = this.now();

    if (now - this.lastWarningAt < WARNING_COOLDOWN_MS) {
      return;
    }

    this.lastWarningAt = now;
    this.logger.warn(message);
  }

  private describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
