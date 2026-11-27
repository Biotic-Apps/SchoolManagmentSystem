import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppConfigService } from '../../config/app-config.service';
import { CacheStore } from '../cache/cache-store';
import { AUTH_THROTTLE_KEY } from './auth-throttle.decorator';
import { CacheThrottlerStorage } from './cache-throttler.storage';
import { callerTracker, credentialTracker, ipTracker } from './request-tracker';

const isAuthRoute = (handler: object, controller: object): boolean =>
  Reflect.getMetadata(AUTH_THROTTLE_KEY, handler) === true ||
  Reflect.getMetadata(AUTH_THROTTLE_KEY, controller) === true;

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [AppConfigService, CacheStore],
      useFactory: (config: AppConfigService, cache: CacheStore) => ({
        storage: new CacheThrottlerStorage(cache),
        throttlers: [
          {
            name: 'default',
            ttl: 60_000,
            limit: config.get('THROTTLE_LIMIT'),
            getTracker: callerTracker,
          },
          {
            name: 'auth',
            ttl: 60_000,
            limit: config.get('AUTH_THROTTLE_LIMIT'),
            // Strict budget for credential endpoints per client IP + account (request-tracker.ts).
            getTracker: credentialTracker,
            skipIf: (context) =>
              !isAuthRoute(context.getHandler(), context.getClass()),
          },
          {
            name: 'auth-ip',
            ttl: 60_000,
            // Looser cap per IP across all accounts: stops one address spraying many accounts.
            limit: config.get('AUTH_THROTTLE_LIMIT') * 10,
            getTracker: ipTracker,
            skipIf: (context) =>
              !isAuthRoute(context.getHandler(), context.getClass()),
          },
        ],
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class ThrottlingModule {}
