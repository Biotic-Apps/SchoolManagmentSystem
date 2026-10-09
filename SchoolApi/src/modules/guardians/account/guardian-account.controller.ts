import {
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
  GuardianPasswordResetDto,
  GuardianSignInSentDto,
} from '../dto/guardian.dto';
import { GuardianAccountService } from './guardian-account.service';

/** Help an existing parent login sign in (created by POST /guardians/:id/account). */
@ApiTags('guardians')
@ApiBearerAuth()
@Controller('guardians')
export class GuardianAccountController {
  constructor(private readonly accounts: GuardianAccountService) {}

  /** Also needs users.edit. */
  @Post(':id/account/reset-password')
  @HttpCode(200)
  @RequirePermission('guardians.edit')
  @ApiData(GuardianPasswordResetDto)
  resetPassword(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GuardianPasswordResetDto> {
    return this.accounts.resetPassword(user, scope, id);
  }

  @Post(':id/account/send-sign-in')
  @HttpCode(200)
  @RequirePermission('guardians.edit')
  @ApiData(GuardianSignInSentDto)
  sendSignIn(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GuardianSignInSentDto> {
    return this.accounts.sendSignIn(user, scope, id);
  }
}
