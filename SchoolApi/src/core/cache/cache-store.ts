export interface CounterResult {
  count: number;
  ttlMs: number;
}

/** Key/value cache shared by auth checks and throttling (Redis or memory). */
export abstract class CacheStore {
  abstract get<T>(key: string): Promise<T | undefined>;
  abstract set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  abstract del(...keys: string[]): Promise<void>;
  abstract delByPrefix(prefix: string): Promise<void>;
  /** Atomically increments a counter that expires `ttlMs` after creation. */
  abstract increment(key: string, ttlMs: number): Promise<CounterResult>;

  async getOrLoad<T>(
    key: string,
    ttlSeconds: number,
    load: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await load();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}
