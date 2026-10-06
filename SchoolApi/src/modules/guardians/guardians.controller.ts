import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { GuardianDto } from '../students/dto/student.dto';
import { ContactChangeService } from './contact-change/contact-change.service';
import { GuardianAccountDto, GuardianDetailDto } from './dto/guardian.dto';
import {
  ContactChangeDto,
  ContactChangeResultDto,
  GuardianQueryDto,
  UpdateGuardianDto,
} from './dto/guardian-input.dto';
import { GuardiansService } from './guardians.service';

@ApiTags('guardians')
@ApiBearerAuth()
@Controller('guardians')
export class GuardiansController {
  constructor(
    private readonly guardians: GuardiansService,
    private readonly contactChange: ContactChangeService,
  ) {}

  @Get()
  @RequirePermission('guardians.view')
  @ApiPage(GuardianDto)
  list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: GuardianQueryDto,
  ): Promise<PageResult<GuardianDto>> {
    return this.guardians.list(user, scope, query);
  }

  @Post('me/contact-change')
  @RequirePermission('guardians.add')
  @ApiData(ContactChangeResultDto)
  requestContactChange(
    @CurrentUser() user: AuthUser,
    @Body() body: ContactChangeDto,
  ): Promise<ContactChangeResultDto> {
    return this.contactChange.request(user, body);
  }

  @Get(':id')
  @RequirePermission('guardians.view')
  @ApiData(GuardianDetailDto)
  get(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GuardianDetailDto> {
    return this.guardians.get(user, scope, id);
  }

  @Patch(':id')
  @RequirePermission('guardians.edit')
  @ApiData(GuardianDetailDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateGuardianDto,
  ): Promise<GuardianDetailDto> {
    return this.guardians.update(user, scope, id, body);
  }

  @Post(':id/account')
  @RequirePermission('guardians.edit')
  @ApiData(GuardianAccountDto)
  createAccount(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GuardianAccountDto> {
    return this.guardians.createAccount(user, scope, id);
  }
}
