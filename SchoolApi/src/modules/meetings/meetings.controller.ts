import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
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
import {
  CompleteMeetingDto,
  CreateMeetingDto,
  MeetingQueryDto,
  MeetingReasonDto,
} from './dto/meeting-input.dto';
import { MeetingDto } from './dto/meeting.dto';
import { MeetingActionsService } from './meeting-actions.service';
import { MeetingsService } from './meetings.service';
import { SlotBookingService } from './slot-booking.service';

@ApiTags('meetings')
@ApiBearerAuth()
@Controller('meetings')
export class MeetingsController {
  constructor(
    private readonly meetings: MeetingsService,
    private readonly booking: SlotBookingService,
    private readonly actions: MeetingActionsService,
  ) {}

  @Post()
  @RequirePermission('meetings.add')
  @ApiData(MeetingDto)
  async create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateMeetingDto,
  ): Promise<MeetingDto> {
    const id = await this.booking.create(user, scope, body);
    return this.meetings.get(user, scope, id);
  }

  @Get()
  @RequirePermission('meetings.view')
  @ApiPage(MeetingDto)
  list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: MeetingQueryDto,
  ): Promise<PageResult<MeetingDto>> {
    return this.meetings.list(user, scope, query);
  }

  @Get(':id')
  @RequirePermission('meetings.view')
  @ApiData(MeetingDto)
  get(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MeetingDto> {
    return this.meetings.get(user, scope, id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @RequirePermission('meetings.view')
  @ApiData(MeetingDto)
  cancel(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: MeetingReasonDto,
  ): Promise<MeetingDto> {
    return this.actions.cancel(user, scope, id, body);
  }

  @Post(':id/complete')
  @HttpCode(200)
  @RequirePermission('meetings.add')
  @ApiData(MeetingDto)
  complete(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CompleteMeetingDto,
  ): Promise<MeetingDto> {
    return this.actions.complete(user, scope, id, body);
  }

  @Post(':id/no-show')
  @HttpCode(200)
  @RequirePermission('meetings.add')
  @ApiData(MeetingDto)
  noShow(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: MeetingReasonDto,
  ): Promise<MeetingDto> {
    return this.actions.noShow(user, scope, id, body);
  }
}
