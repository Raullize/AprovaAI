/**
 * Operações mínimas de chave-valor usadas pelo cache e pelo rate limiter.
 * Mantém os adapters independentes do cliente Redis concreto.
 */
export abstract class RedisStore {
  abstract get(key: string): Promise<string | null>;

  abstract set(key: string, value: string, ttlMs: number): Promise<void>;

  /**
   * Grava apenas se a chave não existir. Retorna `true` quando a reserva
   * foi adquirida. É a primitiva atômica usada pelo rate limiter.
   */
  abstract setIfAbsent(
    key: string,
    value: string,
    ttlMs: number,
  ): Promise<boolean>;

  abstract pttl(key: string): Promise<number>;

  abstract del(...keys: string[]): Promise<number>;
}

export class RedisUnavailableError extends Error {
  constructor() {
    super('Redis indisponível');
    this.name = 'RedisUnavailableError';
  }
}
