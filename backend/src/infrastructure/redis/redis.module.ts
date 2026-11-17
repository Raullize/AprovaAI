import { Module } from '@nestjs/common';
import { NodeRedisStore } from './node-redis.store';
import { RedisConnection } from './redis-connection';
import { RedisStore } from './redis-store';

@Module({
  providers: [
    {
      provide: RedisConnection,
      useFactory: () =>
        new RedisConnection({
          url: process.env.REDIS_URL,
        }),
    },
    {
      provide: RedisStore,
      useFactory: (connection: RedisConnection) =>
        new NodeRedisStore(connection),
      inject: [RedisConnection],
    },
  ],
  exports: [RedisConnection, RedisStore],
})
export class RedisModule {}
