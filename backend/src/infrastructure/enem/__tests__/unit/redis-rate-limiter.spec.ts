import { RateLimiter } from '../../../../application/content/ports/rate-limiter';
import { RedisStore } from '../../../redis/redis-store';
import { RedisRateLimiter } from '../../rate-limit/redis-rate-limiter';

class FakeRedisStore extends RedisStore {
  setIfAbsentResults: boolean[] = [];
  pttlValue = 0;
  failOnSetIfAbsent = false;

  setIfAbsent(): Promise<boolean> {
    if (this.failOnSetIfAbsent) {
      return Promise.reject(new Error('redis down'));
    }

    return Promise.resolve(this.setIfAbsentResults.shift() ?? false);
  }

  pttl(): Promise<number> {
    return Promise.resolve(this.pttlValue);
  }

  get(): Promise<string | null> {
    return Promise.reject(new Error('not used'));
  }

  set(): Promise<void> {
    return Promise.reject(new Error('not used'));
  }

  del(): Promise<number> {
    return Promise.reject(new Error('not used'));
  }
}

describe('RedisRateLimiter', () => {
  const key = 'aprovaai:enem:v1:rate-limit';

  it('should not wait when the Redis slot is acquired', async () => {
    const store = new FakeRedisStore();
    store.setIfAbsentResults = [true];

    const sleeps: number[] = [];
    const acquire = jest.fn();
    const fallback = { acquire } as unknown as RateLimiter;
    const limiter = new RedisRateLimiter(store, fallback, (ms) => {
      sleeps.push(ms);
      return Promise.resolve();
    });

    await limiter.acquire(key, 1_100);

    expect(sleeps).toEqual([]);
    expect(acquire).not.toHaveBeenCalled();
  });

  it('should wait the remaining TTL when the slot is busy', async () => {
    const store = new FakeRedisStore();
    store.setIfAbsentResults = [false, true];
    store.pttlValue = 40;

    const sleeps: number[] = [];
    const acquire = jest.fn();
    const fallback = { acquire } as unknown as RateLimiter;
    const limiter = new RedisRateLimiter(store, fallback, (ms) => {
      sleeps.push(ms);
      return Promise.resolve();
    });

    await limiter.acquire(key, 1_100);

    expect(sleeps).toEqual([40]);
    expect(acquire).not.toHaveBeenCalled();
  });

  it('should use the local fallback when Redis fails', async () => {
    const store = new FakeRedisStore();
    store.failOnSetIfAbsent = true;

    const acquire = jest.fn().mockResolvedValue(undefined);
    const fallback = { acquire } as unknown as RateLimiter;
    const limiter = new RedisRateLimiter(store, fallback);

    await limiter.acquire(key, 1_100);

    expect(acquire).toHaveBeenCalledWith(key, 1_100);
  });
});
