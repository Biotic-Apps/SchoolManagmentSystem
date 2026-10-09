import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  SaveSkillRatingsDto,
  SkillConfigDto,
  SkillGridDto,
  SkillGridQueryDto,
  UpdateSkillConfigDto,
} from './dto/skill.dto';
import { SkillConfigService } from './skill-config.service';
import { SkillRatingsService } from './skill-ratings.service';

@ApiTags('exams')
@ApiBearerAuth()
@Controller()
export class SkillsController {
  constructor(
    private readonly config: SkillConfigService,
    private readonly ratings: SkillRatingsService,
  ) {}

  @Get('branches/:id/skills')
  @RequirePermission('exams.view')
  @ApiData(SkillConfigDto)
  getConfig(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SkillConfigDto> {
    return this.config.get(scope, id);
  }

  @Put('branches/:id/skills')
  @RequirePermission('exams.edit')
  @ApiData(SkillConfigDto)
  replaceConfig(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSkillConfigDto,
  ): Promise<SkillConfigDto> {
    return this.config.replace(scope, id, body);
  }

  @Get('exams/:id/skills')
  @RequirePermission('exams.view')
  @ApiData(SkillGridDto)
  grid(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SkillGridQueryDto,
  ): Promise<SkillGridDto> {
    return this.ratings.grid(scope, id, query.sectionId);
  }

  @Put('exams/:id/skills')
  @RequirePermission('exams.edit')
  @ApiData(SkillGridDto)
  save(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SaveSkillRatingsDto,
  ): Promise<SkillGridDto> {
    return this.ratings.save(user, scope, id, body);
  }
}
