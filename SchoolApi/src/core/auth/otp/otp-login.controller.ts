import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { ApiData } from '../../common/swagger/api-data.decorator';
import { AuthThrottle } from '../../throttling/auth-throttle.decorator';
import { clientIp, userAgent } from '../client-info';
import type { LoginResultDto } from '../dto/auth-tokens.dto';
import { ApiLoginResult } from '../dto/login-result.decorator';
import {
  OtpRequestResultDto,
  RequestOtpDto,
  VerifyOtpDto,
} from './dto/otp-login.dto';
import { OtpRequestService } from './otp-request.service';
import { OtpVerifyService } from './otp-verify.service';

/** Parent phone + one-time code sign-in (phase6-contract §B). */
@ApiTags('auth')
@Public()
@AuthThrottle()
@Controller('auth/otp')
export class OtpLoginController {
  constructor(
    private readonly requests: OtpRequestService,
    private readonly verifier: OtpVerifyService,
  ) {}

  @Post('request')
  @HttpCode(200)
  @ApiData(OtpRequestResultDto)
  request(@Body() body: RequestOtpDto): Promise<OtpRequestResultDto> {
    return this.requests.request(body.phone);
  }

  @Post('verify')
  @HttpCode(200)
  @ApiLoginResult()
  verify(
    @Body() body: VerifyOtpDto,
    @Req() req: Request,
  ): Promise<LoginResultDto> {
    return this.verifier.verify(body.phone, body.code, {
      platform: body.platform,
      deviceName: body.deviceName,
      ip: clientIp(req),
      userAgent: userAgent(req),
    });
  }
}
