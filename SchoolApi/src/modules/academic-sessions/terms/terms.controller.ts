import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { OK, OkDto } from '../../../core/common/dto/ok.dto';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CreateTermDto } from '../dto/create-term.dto';
import { TermDto } from '../dto/term.dto';
import { UpdateTermDto } from '../dto/update-term.dto';
import { TermsService } from './terms.service';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller()
export class TermsController {
  constructor(private readonly terms: TermsService) {}

  @Get('sessions/:id/terms')
  @RequirePermission('sessions.view')
  @ApiData(TermDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TermDto[]> {
    return this.terms.list(scope, id);
  }

  @Post('sessions/:id/terms')
  @RequirePermission('sessions.edit')
  @ApiData(TermDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateTermDto,
  ): Promise<TermDto> {
    return this.terms.create(user, scope, id, body);
  }

  @Patch('terms/:id')
  @RequirePermission('sessions.edit')
  @ApiData(TermDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTermDto,
  ): Promise<TermDto> {
    return this.terms.update(user, scope, id, body);
  }

  @Delete('terms/:id')
  @RequirePermission('sessions.edit')
  @ApiData(OkDto)
  async remove(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OkDto> {
    await this.terms.remove(scope, id);
    return OK;
  }
}
