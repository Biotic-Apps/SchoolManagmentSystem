import { Global, Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { CacheStore } from './cache-store';
import { MemoryCacheStore } from './memory-cache.store';
import { RedisCacheStore } from './redis-cache.store';

@Global()
@Module({
  providers: [
    {
      provide: CacheStore,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): CacheStore =>
        config.get('CACHE_DRIVER') === 'memory'
          ? new MemoryCacheStore()
          : new RedisCacheStore(config.get('REDIS_URL') ?? ''),
    },
  ],
  exports: [CacheStore],
})
export class CacheModule {}
