import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { PayslipDto, PayslipQueryDto } from './dto/payslip.dto';
import { PayslipsService } from './payslips.service';

@ApiTags('payroll')
@ApiBearerAuth()
@Controller('payslips')
export class PayslipsController {
  constructor(private readonly payslips: PayslipsService) {}

  /** Own payslip only (approved runs); 404 when none. */
  @Get('me')
  @RequirePermission('self.payroll.view', 'payroll.view')
  @ApiData(PayslipDto)
  mine(
    @CurrentUser() user: AuthUser,
    @Query() query: PayslipQueryDto,
  ): Promise<PayslipDto> {
    return this.payslips.mine(user, query.month);
  }

  /** A staff member's payslip; reads of others' pay are audited. */
  @Get(':staffId')
  @RequirePermission('payroll.view')
  @ApiData(PayslipDto)
  forStaff(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Query() query: PayslipQueryDto,
  ): Promise<PayslipDto> {
    return this.payslips.forStaff(user, scope, staffId, query.month);
  }
}
