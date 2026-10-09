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
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { MeetingReasonDto } from './dto/meeting-input.dto';
import {
  AcceptMeetingDto,
  MeetingTeachersQueryDto,
  MeetingTeacherDto,
  ParentMeetingRequestDto,
} from './dto/meeting-request.dto';
import { MeetingDto } from './dto/meeting.dto';
import { MeetingRequestsService } from './meeting-requests.service';
import { MeetingTeachersService } from './meeting-teachers.service';
import { MeetingsService } from './meetings.service';

/** Registered before MeetingsController so `teachers` / `requests` win over `:id`. */
@ApiTags('meetings')
@ApiBearerAuth()
@Controller('meetings')
export class MeetingRequestsController {
  constructor(
    private readonly teachers: MeetingTeachersService,
    private readonly requests: MeetingRequestsService,
    private readonly meetings: MeetingsService,
  ) {}

  /** The child's teachers and principal, with their open slot counts. */
  @Get('teachers')
  @RequirePermission('meetings.view')
  @ApiData(MeetingTeacherDto, { isArray: true })
  listTeachers(
    @CurrentScope() scope: Scope,
    @Query() query: MeetingTeachersQueryDto,
  ): Promise<MeetingTeacherDto[]> {
    return this.teachers.forStudent(scope, query.studentId);
  }

  /** Parent asks a teacher for a preferred time (status REQUESTED). */
  @Post('requests')
  @RequirePermission('meetings.add')
  @ApiData(MeetingDto)
  async request(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: ParentMeetingRequestDto,
  ): Promise<MeetingDto> {
    const id = await this.requests.request(user, scope, body);
    return this.meetings.get(user, scope, id);
  }

  @Post(':id/accept')
  @HttpCode(200)
  @RequirePermission('meetings.add')
  @ApiData(MeetingDto)
  accept(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AcceptMeetingDto,
  ): Promise<MeetingDto> {
    return this.requests.accept(user, scope, id, body);
  }

  @Post(':id/decline')
  @HttpCode(200)
  @RequirePermission('meetings.add')
  @ApiData(MeetingDto)
  decline(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: MeetingReasonDto,
  ): Promise<MeetingDto> {
    return this.requests.decline(user, scope, id, body);
  }
}
