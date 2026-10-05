import type { ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import type { CacheStore } from '../cache/cache-store';

/** Throttler counters kept in the shared cache (Redis in production). */
export class CacheThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly cache: CacheStore) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    _blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const { count, ttlMs } = await this.cache.increment(
      `throttle:${throttlerName}:${key}`,
      ttl,
    );
    const seconds = Math.ceil(ttlMs / 1000);
    const isBlocked = count > limit;
    return {
      totalHits: count,
      timeToExpire: seconds,
      isBlocked,
      timeToBlockExpire: isBlocked ? seconds : 0,
    };
  }
}
