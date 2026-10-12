import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { QrScanInputDto, QrScanLogDto, QrScanResultDto } from './qr-scan.dto';
import { QrScanService } from './qr-scan.service';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
export class QrScanController {
  constructor(private readonly qrScan: QrScanService) {}

  @Post('qr-scan')
  @HttpCode(200)
  @RequirePermission('attendance.add')
  @ApiData(QrScanResultDto)
  scan(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: QrScanInputDto,
  ): Promise<QrScanResultDto> {
    return this.qrScan.scan(user, scope, body);
  }

  @Get('qr-scan/logs')
  @RequirePermission('attendance.view')
  @ApiData(QrScanLogDto, { isArray: true })
  logs(@CurrentScope() scope: Scope): Promise<QrScanLogDto[]> {
    return this.qrScan.recentLogs(scope);
  }
}
