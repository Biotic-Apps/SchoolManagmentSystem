import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { OK, OkDto } from '../../common/dto/ok.dto';
import { ApiData } from '../../common/swagger/api-data.decorator';
import type { AuthUser } from '../../common/types/auth-user';
import { AuthThrottle } from '../../throttling/auth-throttle.decorator';
import { clientIp, userAgent } from '../client-info';
import { AuthTokensDto } from '../dto/auth-tokens.dto';
import { AllowPendingPassword } from '../guards/allow-pending-password.decorator';
import {
  DisableTwoFactorDto,
  EnableTwoFactorDto,
  RecoveryCodesDto,
  TwoFactorCodeDto,
  TwoFactorSetupDto,
  TwoFactorStatusDto,
  VerifyTwoFactorDto,
} from './dto/two-factor.dto';
import { TwoFactorLoginService } from './two-factor-login.service';
import { TwoFactorService } from './two-factor.service';

/** Every route acts on the caller's own account only. */
@ApiTags('auth')
@ApiBearerAuth()
@AllowPendingPassword()
@Controller('auth/2fa')
export class TwoFactorController {
  constructor(
    private readonly twoFactor: TwoFactorService,
    private readonly login: TwoFactorLoginService,
  ) {}

  @Get()
  @ApiData(TwoFactorStatusDto)
  status(@CurrentUser() user: AuthUser): Promise<TwoFactorStatusDto> {
    return this.twoFactor.status(user.id);
  }

  @Post('setup')
  @HttpCode(200)
  @ApiData(TwoFactorSetupDto)
  setup(@CurrentUser() user: AuthUser): Promise<TwoFactorSetupDto> {
    return this.twoFactor.setup(user.id);
  }

  @AuthThrottle()
  @Post('enable')
  @HttpCode(200)
  @ApiData(RecoveryCodesDto)
  enable(
    @CurrentUser() user: AuthUser,
    @Body() body: EnableTwoFactorDto,
  ): Promise<RecoveryCodesDto> {
    return this.twoFactor.enable(user, body.code);
  }

  @AuthThrottle()
  @Post('disable')
  @HttpCode(200)
  @ApiData(OkDto)
  async disable(
    @CurrentUser() user: AuthUser,
    @Body() body: DisableTwoFactorDto,
  ): Promise<OkDto> {
    await this.twoFactor.disable(user.id, body.password, body.code);
    return OK;
  }

  @AuthThrottle()
  @Post('recovery-codes/regenerate')
  @HttpCode(200)
  @ApiData(RecoveryCodesDto)
  regenerate(
    @CurrentUser() user: AuthUser,
    @Body() body: TwoFactorCodeDto,
  ): Promise<RecoveryCodesDto> {
    return this.twoFactor.regenerateRecoveryCodes(user.id, body.code);
  }

  @Public()
  @AuthThrottle()
  @Post('verify')
  @HttpCode(200)
  @ApiData(AuthTokensDto)
  verify(
    @Body() body: VerifyTwoFactorDto,
    @Req() req: Request,
  ): Promise<AuthTokensDto> {
    return this.login.verify(body.challengeId, body.code, {
      ip: clientIp(req),
      userAgent: userAgent(req),
    });
  }
}
