import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { FollowUpQueryDto } from '../dto/meeting-input.dto';
import { FollowUpDto } from '../dto/meeting.dto';
import { FollowUpsService } from './follow-ups.service';

@ApiTags('meetings')
@ApiBearerAuth()
@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUps: FollowUpsService) {}

  @Get()
  @RequirePermission('meetings.view')
  @ApiData(FollowUpDto, { isArray: true })
  list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: FollowUpQueryDto,
  ): Promise<FollowUpDto[]> {
    return this.followUps.list(user, scope, query);
  }

  @Post(':id/done')
  @HttpCode(200)
  @RequirePermission('meetings.view')
  @ApiData(FollowUpDto)
  done(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FollowUpDto> {
    return this.followUps.done(user, id);
  }
}
