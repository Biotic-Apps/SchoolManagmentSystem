import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { AckSmsDto, GatewayStatusDto, PendingSmsDto } from './dto/sms-gateway.dto';
import { SmsGatewayService } from './sms-gateway.service';

@ApiTags('sms-gateway')
@ApiBearerAuth()
@Controller('sms-gateway')
export class SmsGatewayController {
  constructor(private readonly gateway: SmsGatewayService) {}

  /** Phone polls for pending SMS to send. */
  @Get('pending')
  @RequirePermission('settings.view')
  @ApiData(PendingSmsDto)
  pending(@CurrentScope() scope: Scope): Promise<PendingSmsDto[]> {
    return this.gateway.pending(scope);
  }

  /** Phone acknowledges a message was sent or failed. */
  @Post(':id/ack')
  @HttpCode(200)
  @RequirePermission('settings.view')
  @ApiData(Object)
  async ack(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AckSmsDto,
  ): Promise<{ ok: true }> {
    await this.gateway.acknowledge(scope, id, body);
    return { ok: true };
  }

  /** Gateway status for the settings page. */
  @Get('status')
  @RequirePermission('settings.view')
  @ApiData(GatewayStatusDto)
  status(@CurrentScope() scope: Scope): Promise<GatewayStatusDto> {
    return this.gateway.status(scope);
  }
}
