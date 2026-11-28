import { EnemQuestion } from '../../../../application/content/ports/enem-question-bank';
import { InMemoryEnemQuestionCache } from '../../cache/in-memory-enem-question-cache';
import { RedisEnemQuestionCache } from '../../cache/redis-enem-question-cache';
import { InMemoryRateLimiter } from '../../rate-limit/in-memory-rate-limiter';
import { RedisRateLimiter } from '../../rate-limit/redis-rate-limiter';
import { NodeRedisStore } from '../../../redis/node-redis.store';
import { RedisConnection } from '../../../redis/redis-connection';

const runIntegration =
  process.env.REDIS_INTEGRATION_TEST === '1' && Boolean(process.env.REDIS_URL);

const question: EnemQuestion = {
  sourceRef: 'enem:2023:1',
  year: 2023,
  index: 1,
  discipline: 'matematica',
  language: null,
  content: 'Questão de teste',
  options: [
    { text: 'Alternativa A', isCorrect: false },
    { text: 'Alternativa B', isCorrect: true },
  ],
};

const uniquePrefix = `aprovaai:test:${Date.now()}:${Math.random()
  .toString(16)
  .slice(2)}`;
const cacheKey = `${uniquePrefix}:cache`;
const rateLimitKey = `${uniquePrefix}:rate-limit`;

(runIntegration ? describe : describe.skip)('Redis ENEM integration', () => {
  let connection: RedisConnection;
  let store: NodeRedisStore;

  beforeAll(async () => {
    connection = new RedisConnection({ url: process.env.REDIS_URL });
    store = new NodeRedisStore(connection);

    const client = await connection.getClient();

    if (!client) {
      throw new Error(
        'Redis não disponível. Verifique REDIS_URL antes de rodar o teste de integração.',
      );
    }
  });

  afterAll(async () => {
    await store.del(cacheKey, rateLimitKey);
    await connection.close();
  });

  it('should store and read questions in Redis with TTL', async () => {
    const cache = new RedisEnemQuestionCache(
      store,
      new InMemoryEnemQuestionCache(),
    );

    await cache.set(cacheKey, [question], 5_000);

    await expect(cache.get(cacheKey)).resolves.toEqual([question]);

    const ttl = await store.pttl(cacheKey);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(5_000);
  });

  it('should share the rate limit window between instances', async () => {
    const intervalMs = 300;
    const first = new RedisRateLimiter(store, new InMemoryRateLimiter());
    const second = new RedisRateLimiter(store, new InMemoryRateLimiter());

    const startedAt = Date.now();
    await first.acquire(rateLimitKey, intervalMs);
    const afterFirst = Date.now() - startedAt;

    await second.acquire(rateLimitKey, intervalMs);
    const elapsed = Date.now() - startedAt;

    expect(afterFirst).toBeLessThan(intervalMs);
    expect(elapsed).toBeGreaterThanOrEqual(intervalMs - 20);
  });
});
