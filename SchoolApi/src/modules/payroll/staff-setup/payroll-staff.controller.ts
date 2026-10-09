import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  BranchPrincipalDto,
  PayrollStaffListDto,
  PayrollStaffQueryDto,
  PrincipalPayrollDto,
} from './dto/payroll-staff.dto';
import { PayrollStaffService } from './payroll-staff.service';

@ApiTags('payroll')
@ApiBearerAuth()
@Controller('payroll/staff')
export class PayrollStaffController {
  constructor(private readonly staff: PayrollStaffService) {}

  /** Active staff of every type with their current salary (null = not set). */
  @Get()
  @RequirePermission('payroll.view')
  @ApiData(PayrollStaffListDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: PayrollStaffQueryDto,
  ): Promise<PayrollStaffListDto> {
    return this.staff.list(scope, query.branchId, query.designation);
  }

  @Post('principal')
  @RequirePermission('payroll.edit')
  @ApiData(BranchPrincipalDto)
  addPrincipal(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: PrincipalPayrollDto,
  ): Promise<BranchPrincipalDto> {
    return this.staff.addPrincipal(user, scope, body.branchId);
  }
}
