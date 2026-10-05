import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { APP_VERSION } from '../../config/app-version';
import { Public } from '../common/decorators/public.decorator';
import { HealthStatusDto } from './health-status.dto';

@ApiTags('health')
@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ type: HealthStatusDto })
  check(): HealthStatusDto {
    return { status: 'ok', version: APP_VERSION };
  }
}
