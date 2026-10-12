import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../../core/common/types/auth-user';
import { RequirePermission } from '../../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../../core/rbac/scope/scope';
import {
  StaffIdCardPrintDto,
  StaffIdCardPrintJobDto,
} from './staff-id-card-bulk.dto';
import { StaffIdCardBulkService } from './staff-id-card-bulk.service';

@ApiTags('staff')
@ApiBearerAuth()
@Controller('staff/id-cards/print')
export class StaffIdCardBulkController {
  constructor(private readonly bulk: StaffIdCardBulkService) {}

  /** A4 sheets (10 cards each, cut marks) for a branch. */
  @Post()
  @HttpCode(200)
  @RequirePermission('staff.edit')
  @ApiData(StaffIdCardPrintJobDto)
  print(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: StaffIdCardPrintDto,
  ): Promise<StaffIdCardPrintJobDto> {
    return this.bulk.request(user, scope, body);
  }
}
