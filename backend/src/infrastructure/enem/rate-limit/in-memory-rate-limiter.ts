import { RateLimiter } from '../../../application/content/ports/rate-limiter';

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Rate limiter local ao processo. Mantém o último instante de aquisição
 * por chave e dorme o tempo restante da janela.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly lastAcquiredAt = new Map<string, number>();

  constructor(
    private readonly sleep: (ms: number) => Promise<void> = defaultSleep,
    private readonly now: () => number = () => Date.now(),
  ) {}

  async acquire(key: string, intervalMs: number): Promise<void> {
    const last = this.lastAcquiredAt.get(key);

    if (last !== undefined) {
      const elapsed = this.now() - last;

      if (elapsed < intervalMs) {
        await this.sleep(intervalMs - elapsed);
      }
    }

    this.lastAcquiredAt.set(key, this.now());
  }
}
