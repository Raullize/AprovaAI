import { Logger } from '@nestjs/common';
import { RateLimiter } from '../../../application/content/ports/rate-limiter';
import { RedisStore } from '../../redis/redis-store';

const WARNING_COOLDOWN_MS = 30_000;

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Rate limiter distribuído.
 *
 * Cada aquisição tenta criar a chave com `SET NX PX` (atômico). Quem
 * consegue reserva a janela de `intervalMs`; os demais esperam o TTL
 * restante e tentam novamente. Assim o limite de 1 req/s vale para todas
 * as instâncias do backend que compartilham o mesmo Redis.
 */
export class RedisRateLimiter extends RateLimiter {
  private readonly logger = new Logger(RedisRateLimiter.name);
  private lastWarningAt = 0;

  constructor(
    private readonly store: RedisStore,
    private readonly fallback: RateLimiter,
    private readonly sleep: (ms: number) => Promise<void> = defaultSleep,
    private readonly now: () => number = () => Date.now(),
  ) {
    super();
  }

  async acquire(key: string, intervalMs: number): Promise<void> {
    try {
      await this.acquireDistributed(key, intervalMs);
    } catch (error) {
      this.warn(
        `Falha no rate limit distribuído; usando fallback local. ${this.describe(
          error,
        )}`,
      );
      await this.fallback.acquire(key, intervalMs);
    }
  }

  private async acquireDistributed(
    key: string,
    intervalMs: number,
  ): Promise<void> {
    for (;;) {
      const acquired = await this.store.setIfAbsent(key, '1', intervalMs);

      if (acquired) {
        return;
      }

      const remainingTtl = await this.store.pttl(key);
      const waitMs =
        remainingTtl > 0 ? Math.min(remainingTtl, intervalMs) : intervalMs;

      await this.sleep(waitMs);
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
