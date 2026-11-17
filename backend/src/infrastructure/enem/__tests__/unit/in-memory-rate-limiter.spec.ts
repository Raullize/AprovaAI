import { InMemoryRateLimiter } from '../../rate-limit/in-memory-rate-limiter';

describe('InMemoryRateLimiter', () => {
  it('should not wait on the first acquisition', async () => {
    let now = 0;
    const waits: number[] = [];
    const limiter = new InMemoryRateLimiter(
      (ms) => {
        waits.push(ms);
        now += ms;
        return Promise.resolve();
      },
      () => now,
    );

    await limiter.acquire('enem', 1_100);

    expect(waits).toEqual([]);
    expect(now).toBe(0);
  });

  it('should wait the remaining interval on the next acquisition', async () => {
    let now = 0;
    const waits: number[] = [];
    const limiter = new InMemoryRateLimiter(
      (ms) => {
        waits.push(ms);
        now += ms;
        return Promise.resolve();
      },
      () => now,
    );

    await limiter.acquire('enem', 1_100);
    now = 300;
    await limiter.acquire('enem', 1_100);

    expect(waits).toEqual([800]);
  });

  it('should keep independent windows per key', async () => {
    let now = 0;
    const waits: number[] = [];
    const limiter = new InMemoryRateLimiter(
      (ms) => {
        waits.push(ms);
        now += ms;
        return Promise.resolve();
      },
      () => now,
    );

    await limiter.acquire('enem', 1_100);
    await limiter.acquire('outro-servico', 1_100);

    expect(waits).toEqual([]);
  });
});
