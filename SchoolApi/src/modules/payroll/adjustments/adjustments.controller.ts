import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  ApiData,
  ApiPage,
} from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { AdjustmentCancelService } from './adjustment-cancel.service';
import { AdjustmentsService } from './adjustments.service';
import {
  AdjustmentDto,
  AdjustmentQueryDto,
  CancelAdjustmentDto,
  CreateAdjustmentDto,
} from './dto/adjustment.dto';

@ApiTags('payroll')
@ApiBearerAuth()
@Controller('payroll/adjustments')
export class AdjustmentsController {
  constructor(
    private readonly adjustments: AdjustmentsService,
    private readonly cancellation: AdjustmentCancelService,
  ) {}

  @Get()
  @RequirePermission('payroll.view')
  @ApiPage(AdjustmentDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: AdjustmentQueryDto,
  ): Promise<PageResult<AdjustmentDto>> {
    return this.adjustments.list(scope, query);
  }

  @Post()
  @RequirePermission('payroll.edit')
  @ApiData(AdjustmentDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateAdjustmentDto,
  ): Promise<AdjustmentDto> {
    return this.adjustments.create(user, scope, body);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @RequirePermission('payroll.edit')
  @ApiData(AdjustmentDto)
  cancel(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelAdjustmentDto,
  ): Promise<AdjustmentDto> {
    return this.cancellation.cancel(user, scope, id, body.reason);
  }
}
