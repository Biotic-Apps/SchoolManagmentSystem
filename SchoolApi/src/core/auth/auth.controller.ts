import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { OK, OkDto } from '../common/dto/ok.dto';
import { ApiData } from '../common/swagger/api-data.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { AuthThrottle } from '../throttling/auth-throttle.decorator';
import { AuthService } from './auth.service';
import { clientIp, userAgent } from './client-info';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeviceSessionDto } from './dto/device-session.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AllowPendingPassword } from './guards/allow-pending-password.decorator';
import { PasswordService } from './password/password.service';
import { SessionsService } from './sessions/sessions.service';

@ApiTags('auth')
@ApiBearerAuth()
@AllowPendingPassword()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionsService,
  ) {}

  @Public()
  @AuthThrottle()
  @Post('login')
  @HttpCode(200)
  @ApiData(AuthTokensDto)
  login(@Body() body: LoginDto, @Req() req: Request): Promise<AuthTokensDto> {
    return this.auth.login(body.identifier, body.password, {
      platform: body.platform,
      deviceName: body.deviceName,
      ip: clientIp(req),
      userAgent: userAgent(req),
    });
  }

  @Public()
  @AuthThrottle()
  @Post('refresh')
  @HttpCode(200)
  @ApiData(AuthTokensDto)
  refresh(
    @Body() body: RefreshDto,
    @Req() req: Request,
  ): Promise<AuthTokensDto> {
    return this.auth.refresh(body.refreshToken, {
      ip: clientIp(req),
      userAgent: userAgent(req),
    });
  }

  @Post('logout')
  @HttpCode(200)
  @ApiData(OkDto)
  async logout(
    @CurrentUser() user: AuthUser,
    @Body() body: LogoutDto,
  ): Promise<OkDto> {
    await this.auth.logout(user, body.refreshToken);
    return OK;
  }

  @Post('logout-all')
  @HttpCode(200)
  @ApiData(OkDto)
  async logoutAll(@CurrentUser() user: AuthUser): Promise<OkDto> {
    await this.auth.logoutAll(user.id);
    return OK;
  }

  @Public()
  @AuthThrottle()
  @Post('password/forgot')
  @HttpCode(200)
  @ApiData(OkDto)
  async forgot(@Body() body: ForgotPasswordDto): Promise<OkDto> {
    await this.passwords.forgot(body.identifier);
    return OK;
  }

  @Public()
  @AuthThrottle()
  @Post('password/reset')
  @HttpCode(200)
  @ApiData(OkDto)
  async reset(@Body() body: ResetPasswordDto): Promise<OkDto> {
    await this.passwords.reset(body.token, body.newPassword);
    return OK;
  }

  @Post('password/change')
  @HttpCode(200)
  @ApiData(OkDto)
  async change(
    @CurrentUser() user: AuthUser,
    @Body() body: ChangePasswordDto,
  ): Promise<OkDto> {
    await this.passwords.change(
      user.id,
      user.sessionId,
      body.currentPassword,
      body.newPassword,
    );
    return OK;
  }

  @Get('sessions')
  @ApiData(DeviceSessionDto, { isArray: true })
  listSessions(@CurrentUser() user: AuthUser): Promise<DeviceSessionDto[]> {
    return this.sessions.list(user.id, user.sessionId);
  }

  @Delete('sessions/:id')
  @ApiData(OkDto)
  async revokeSession(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OkDto> {
    await this.sessions.revokeOwn(user.id, id);
    return OK;
  }
}
