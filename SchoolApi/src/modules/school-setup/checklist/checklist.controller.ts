import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ChecklistService } from './checklist.service';
import { ChecklistQueryDto } from './dto/checklist-query.dto';
import { SetupChecklistDto } from './dto/setup-checklist.dto';

@ApiTags('school-setup')
@ApiBearerAuth()
@Controller('setup')
export class ChecklistController {
  constructor(private readonly checklist: ChecklistService) {}

  @Get('checklist')
  @RequirePermission('dashboard.view')
  @ApiOperation({
    summary:
      'Setup checklist of a branch (principal: own branch; Super Admin: branchId required)',
  })
  @ApiData(SetupChecklistDto)
  @ApiForbiddenResponse({
    description: 'Not a principal or Super Admin, or branch outside scope',
  })
  get(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: ChecklistQueryDto,
  ): Promise<SetupChecklistDto> {
    return this.checklist.checklist(user, scope, query);
  }
}
