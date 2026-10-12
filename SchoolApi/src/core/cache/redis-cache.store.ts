import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CacheStore, type CounterResult } from './cache-store';

const PREFIX = 'cache:';

@Injectable()
export class RedisCacheStore extends CacheStore implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(redisUrl: string) {
    super();
    this.redis = new Redis(redisUrl, { lazyConnect: true, connectTimeout: 10_000, family: 0 });
  }

  async get<T>(key: string): Promise<T | undefined> {
    const raw = await this.redis.get(PREFIX + key);
    return raw === null ? undefined : (JSON.parse(raw) as T);
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(PREFIX + key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await this.redis.del(...keys.map((k) => PREFIX + k));
  }

  async delByPrefix(prefix: string): Promise<void> {
    let cursor = '0';
    do {
      const [next, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        `${PREFIX}${prefix}*`,
        'COUNT',
        200,
      );
      if (keys.length > 0) await this.redis.del(...keys);
      cursor = next;
    } while (cursor !== '0');
  }

  async increment(key: string, ttlMs: number): Promise<CounterResult> {
    const fullKey = PREFIX + key;
    const result = await this.redis
      .multi()
      .incr(fullKey)
      .pexpire(fullKey, ttlMs, 'NX')
      .pttl(fullKey)
      .exec();
    const count = Number(result?.[0]?.[1] ?? 1);
    const ttl = Number(result?.[2]?.[1] ?? ttlMs);
    return { count, ttlMs: ttl > 0 ? ttl : ttlMs };
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis.status !== 'wait') await this.redis.quit();
  }
}
