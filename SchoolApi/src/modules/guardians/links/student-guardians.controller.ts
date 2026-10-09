import {
  Body,
  Controller,
  Delete,
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
import { GuardianLinkDto } from '../../students/dto/student.dto';
import { AddedGuardianLinkDto } from '../dto/guardian.dto';
import { AddGuardianLinkDto, ReasonDto } from '../dto/guardian-input.dto';
import { StudentGuardiansService } from './student-guardians.service';

@ApiTags('guardians')
@ApiBearerAuth()
@Controller('students/:id/guardians')
export class StudentGuardiansController {
  constructor(private readonly links: StudentGuardiansService) {}

  @Post()
  @RequirePermission('students.edit')
  @ApiData(AddedGuardianLinkDto)
  add(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AddGuardianLinkDto,
  ): Promise<AddedGuardianLinkDto> {
    return this.links.add(user, scope, id, body);
  }

  @Delete(':linkId')
  @RequirePermission('guardians.edit')
  @ApiData(GuardianLinkDto)
  revoke(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('linkId', ParseUUIDPipe) linkId: string,
    @Body() body: ReasonDto,
  ): Promise<GuardianLinkDto> {
    return this.links.revoke(user, scope, id, linkId, body.reason);
  }
}
