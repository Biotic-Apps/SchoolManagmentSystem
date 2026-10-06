import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from '../../config/app-config.service';
import { PolicyGuard } from '../rbac/policy.guard';
import { AuthStateCache } from './auth-state.cache';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LockoutService } from './lockout.service';
import { PasswordPolicyService } from './password/password-policy.service';
import { UserAuthPolicyService } from './policy/user-auth-policy.service';
import { SessionIssuer } from './sessions/session-issuer';
import { TwoFactorCodes } from './two-factor/two-factor-codes';
import { TwoFactorLoginService } from './two-factor/two-factor-login.service';
import { TwoFactorController } from './two-factor/two-factor.controller';
import { TwoFactorRepository } from './two-factor/two-factor.repository';
import { TwoFactorService } from './two-factor/two-factor.service';
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
  controllers: [AuthController, TwoFactorController],
  providers: [
    TokenService,
    PasswordHasher,
    UserAccountRepository,
    RefreshSessionRepository,
    AuthStateCache,
    SessionsService,
    SessionIssuer,
    LockoutService,
    UserAuthPolicyService,
    PasswordPolicyService,
    TwoFactorRepository,
    TwoFactorCodes,
    TwoFactorService,
    TwoFactorLoginService,
    AuthService,
    PasswordService,
    // Order matters: authenticate, then check permissions.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PolicyGuard },
  ],
  exports: [
    PasswordHasher,
    SessionsService,
    AuthStateCache,
    PasswordPolicyService,
    UserAuthPolicyService,
    TwoFactorService,
  ],
})
export class AuthModule {}
