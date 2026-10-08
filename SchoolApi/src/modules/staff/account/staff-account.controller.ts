import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  CreateStaffAccountDto,
  StaffAccountDto,
  StaffPasswordResetDto,
} from './staff-account.dto';
import { StaffAccountService } from './staff-account.service';

/** Sign-in for an existing staff member (needs staff.edit and users.add / users.edit). */
@ApiTags('staff')
@ApiBearerAuth()
@Controller('staff')
export class StaffAccountController {
  constructor(private readonly accounts: StaffAccountService) {}

  @Post(':id/account')
  @RequirePermission('staff.edit')
  @ApiData(StaffAccountDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateStaffAccountDto,
  ): Promise<StaffAccountDto> {
    return this.accounts.create(user, scope, id, body);
  }

  @Post(':id/account/reset-password')
  @HttpCode(200)
  @RequirePermission('staff.edit')
  @ApiData(StaffPasswordResetDto)
  resetPassword(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StaffPasswordResetDto> {
    return this.accounts.resetPassword(user, scope, id);
  }
}
