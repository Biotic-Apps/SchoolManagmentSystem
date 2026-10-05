import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from '../../config/app-config.service';
import { PolicyGuard } from '../rbac/policy.guard';
import { AuthStateCache } from './auth-state.cache';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordHasher } from './password/password-hasher';
import { PasswordService } from './password/password.service';
import { RefreshSessionRepository } from './sessions/refresh-session.repository';
import { SessionsService } from './sessions/sessions.service';
import { TokenService } from './token.service';
import { UserAccountRepository } from './user-account.repository';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { algorithm: 'HS256' },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    TokenService,
    PasswordHasher,
    UserAccountRepository,
    RefreshSessionRepository,
    AuthStateCache,
    SessionsService,
    AuthService,
    PasswordService,
    // Order matters: authenticate, then check permissions.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PolicyGuard },
  ],
  exports: [PasswordHasher, SessionsService, AuthStateCache],
})
export class AuthModule {}
