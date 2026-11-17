import { EnemQuestion } from '../../../../application/content/ports/enem-question-bank';
import { InMemoryEnemQuestionCache } from '../../cache/in-memory-enem-question-cache';
import { RedisEnemQuestionCache } from '../../cache/redis-enem-question-cache';
import { RedisStore } from '../../../redis/redis-store';

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

class FakeRedisStore extends RedisStore {
  readonly values = new Map<string, { value: string; ttlMs: number }>();
  failOnGet = false;
  failOnSet = false;

  get(key: string): Promise<string | null> {
    if (this.failOnGet) {
      return Promise.reject(new Error('redis down'));
    }

    return Promise.resolve(this.values.get(key)?.value ?? null);
  }

  set(key: string, value: string, ttlMs: number): Promise<void> {
    if (this.failOnSet) {
      return Promise.reject(new Error('redis down'));
    }

    this.values.set(key, { value, ttlMs });
    return Promise.resolve();
  }

  setIfAbsent(): Promise<boolean> {
    return Promise.reject(new Error('not used'));
  }

  pttl(): Promise<number> {
    return Promise.reject(new Error('not used'));
  }

  del(...keys: string[]): Promise<number> {
    for (const key of keys) {
      this.values.delete(key);
    }

    return Promise.resolve(keys.length);
  }
}

describe('RedisEnemQuestionCache', () => {
  const key = 'aprovaai:enem:v1:2023:matematica:all';

  it('should serialize questions with TTL and read them back', async () => {
    const store = new FakeRedisStore();
    const cache = new RedisEnemQuestionCache(
      store,
      new InMemoryEnemQuestionCache(),
    );

    await cache.set(key, [question], 600_000);

    expect(store.values.get(key)).toEqual({
      value: JSON.stringify([question]),
      ttlMs: 600_000,
    });
    await expect(cache.get(key)).resolves.toEqual([question]);
  });

  it('should return null on a cache miss', async () => {
    const cache = new RedisEnemQuestionCache(
      new FakeRedisStore(),
      new InMemoryEnemQuestionCache(),
    );

    await expect(cache.get(key)).resolves.toBeNull();
  });

  it('should fall back to the local cache when Redis read fails', async () => {
    const store = new FakeRedisStore();
    const fallback = new InMemoryEnemQuestionCache();
    await fallback.set(key, [question], 600_000);

    store.failOnGet = true;
    const cache = new RedisEnemQuestionCache(store, fallback);

    await expect(cache.get(key)).resolves.toEqual([question]);
  });

  it('should mirror writes to the local cache when Redis write fails', async () => {
    const store = new FakeRedisStore();
    const fallback = new InMemoryEnemQuestionCache();

    store.failOnSet = true;
    const cache = new RedisEnemQuestionCache(store, fallback);

    await expect(cache.set(key, [question], 600_000)).resolves.toBeUndefined();
    await expect(fallback.get(key)).resolves.toEqual([question]);
  });

  it('should ignore invalid JSON stored in Redis', async () => {
    const store = new FakeRedisStore();
    store.values.set(key, { value: '{invalid', ttlMs: 600_000 });

    const cache = new RedisEnemQuestionCache(
      store,
      new InMemoryEnemQuestionCache(),
    );

    await expect(cache.get(key)).resolves.toBeNull();
  });
});
