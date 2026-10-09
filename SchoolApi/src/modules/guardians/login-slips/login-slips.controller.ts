import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  LoginSlipJobDto,
  LoginSlipPreviewDto,
  LoginSlipPrintDto,
} from './login-slip.dto';
import { LoginSlipsService } from './login-slips.service';

/** Bulk parent login slips (A4, three per page). Also needs users.edit. */
@ApiTags('guardians')
@ApiBearerAuth()
@Controller('guardians/login-slips')
export class LoginSlipsController {
  constructor(private readonly slips: LoginSlipsService) {}

  /** What printing would do: new logins, replaced temporary passwords, unchanged. */
  @Post('preview')
  @HttpCode(200)
  @RequirePermission('guardians.edit')
  @ApiData(LoginSlipPreviewDto)
  preview(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: LoginSlipPrintDto,
  ): Promise<LoginSlipPreviewDto> {
    return this.slips.preview(user, scope, body);
  }

  @Post('print')
  @HttpCode(200)
  @RequirePermission('guardians.edit')
  @ApiData(LoginSlipJobDto)
  print(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: LoginSlipPrintDto,
  ): Promise<LoginSlipJobDto> {
    return this.slips.print(user, scope, body);
  }
}
