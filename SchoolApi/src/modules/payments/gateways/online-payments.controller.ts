import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../core/common/decorators/public.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  GatewayCallbackResultDto,
  InitiateOnlineDto,
  InitiateOnlineResultDto,
} from './dto/online-payment.dto';
import { OnlinePaymentsService } from './online-payments.service';

@ApiTags('payments')
@Controller('payments/online')
export class OnlinePaymentsController {
  constructor(private readonly online: OnlinePaymentsService) {}

  @Post('initiate')
  @HttpCode(200)
  @ApiBearerAuth()
  @RequirePermission('fees.add')
  @ApiData(InitiateOnlineResultDto)
  initiate(
    @CurrentScope() scope: Scope,
    @Body() body: InitiateOnlineDto,
  ): Promise<InitiateOnlineResultDto> {
    return this.online.initiate(scope, body.invoiceId);
  }

  /** Called by the gateway; the adapter verifies the signature. */
  @Public()
  @Post('callback/:gateway')
  @HttpCode(200)
  @ApiData(GatewayCallbackResultDto)
  callback(
    @Param('gateway') gateway: string,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: Record<string, unknown>,
    @Query() query: Record<string, unknown>,
  ): Promise<GatewayCallbackResultDto> {
    return this.online.callback(gateway.toUpperCase(), {
      headers,
      body,
      query,
    });
  }
}
