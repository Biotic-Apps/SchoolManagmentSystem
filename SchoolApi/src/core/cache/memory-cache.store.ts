import { Injectable } from '@nestjs/common';
import { CacheStore, type CounterResult } from './cache-store';

interface Entry {
  value: unknown;
  expiresAt: number;
}

/** Single-process cache for development and tests. */
@Injectable()
export class MemoryCacheStore extends CacheStore {
  private readonly entries = new Map<string, Entry>();

  get<T>(key: string): Promise<T | undefined> {
    const entry = this.live(key);
    return Promise.resolve(
      entry ? (structuredClone(entry.value) as T) : undefined,
    );
  }

  set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.entries.set(key, {
      value: structuredClone(value),
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return Promise.resolve();
  }

  del(...keys: string[]): Promise<void> {
    keys.forEach((key) => this.entries.delete(key));
    return Promise.resolve();
  }

  delByPrefix(prefix: string): Promise<void> {
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.entries.delete(key);
    }
    return Promise.resolve();
  }

  increment(key: string, ttlMs: number): Promise<CounterResult> {
    const now = Date.now();
    const entry = this.live(key) ?? { value: 0, expiresAt: now + ttlMs };
    entry.value = (entry.value as number) + 1;
    this.entries.set(key, entry);
    return Promise.resolve({
      count: entry.value as number,
      ttlMs: entry.expiresAt - now,
    });
  }

  private live(key: string): Entry | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry;
  }
}
