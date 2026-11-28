import { RedisClient, RedisConnection } from './redis-connection';
import { RedisStore, RedisUnavailableError } from './redis-store';

/**
 * Implementação de `RedisStore` usando o cliente oficial `redis`.
 * Todas as operações falham com `RedisUnavailableError` quando a conexão
 * não está disponível, para que os adapters acionem o fallback.
 */
export class NodeRedisStore extends RedisStore {
  constructor(private readonly connection: RedisConnection) {
    super();
  }

  async get(key: string): Promise<string | null> {
    return (await this.client()).get(key);
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    await (await this.client()).set(key, value, { PX: ttlMs });
  }

  async setIfAbsent(
    key: string,
    value: string,
    ttlMs: number,
  ): Promise<boolean> {
    const result = await (
      await this.client()
    ).set(key, value, {
      NX: true,
      PX: ttlMs,
    });

    return result === 'OK';
  }

  async pttl(key: string): Promise<number> {
    return (await this.client()).pTTL(key);
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }

    return (await this.client()).del(keys);
  }

  private async client(): Promise<RedisClient> {
    const client = await this.connection.getClient();

    if (!client) {
      throw new RedisUnavailableError();
    }

    return client;
  }
}
