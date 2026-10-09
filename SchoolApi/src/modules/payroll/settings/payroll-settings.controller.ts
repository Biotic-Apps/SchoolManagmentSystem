import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  PayrollSettingsDto,
  PayrollSettingsQueryDto,
  PayrollSettingsViewDto,
} from './dto/payroll-settings.dto';
import { PayrollSettingsService } from './payroll-settings.service';

@ApiTags('payroll')
@ApiBearerAuth()
@Controller('payroll/settings')
export class PayrollSettingsController {
  constructor(private readonly settings: PayrollSettingsService) {}

  @Get()
  @RequirePermission('payroll.view')
  @ApiData(PayrollSettingsViewDto)
  get(
    @CurrentScope() scope: Scope,
    @Query() query: PayrollSettingsQueryDto,
  ): Promise<PayrollSettingsViewDto> {
    return this.settings.get(scope, query.branchId);
  }

  /** Rules apply to the whole school of the branch; they change pay, so approvers set them. */
  @Put()
  @RequirePermission('payroll.approve')
  @ApiData(PayrollSettingsViewDto)
  put(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: PayrollSettingsQueryDto,
    @Body() body: PayrollSettingsDto,
  ): Promise<PayrollSettingsViewDto> {
    return this.settings.put(user, scope, query.branchId, body);
  }
}
