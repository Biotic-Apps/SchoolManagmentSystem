import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
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
import { AllocationService } from './allocation.service';
import {
  SetTeacherDto,
  TeachingStaffQueryDto,
} from './dto/allocation-input.dto';
import {
  AllocationRowDto,
  ClassTeacherRowDto,
  TeachingStaffDto,
} from './dto/allocation.dto';
import { TeachingStaffService } from './teaching-staff.service';

@ApiTags('classes')
@ApiBearerAuth()
@Controller()
export class AllocationController {
  constructor(
    private readonly allocation: AllocationService,
    private readonly teaching: TeachingStaffService,
  ) {}

  @Put('sections/:id/subject-teachers/:subjectId')
  @RequirePermission('timetable.edit', 'staff.edit')
  @ApiOperation({
    summary:
      'Set (or remove with staffId null) the subject teacher of a section',
  })
  @ApiData(AllocationRowDto)
  @ApiBadRequestResponse({
    description: 'SUBJECT_NOT_IN_CLASS | SUBJECT_NOT_IN_GROUP | UNKNOWN_STAFF',
  })
  @ApiConflictResponse({ description: 'STAFF_LEFT' })
  @ApiForbiddenResponse({ description: 'OWN_ASSIGNMENT' })
  subjectTeacher(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Body() body: SetTeacherDto,
  ): Promise<AllocationRowDto> {
    return this.allocation.setSubjectTeacher(
      user,
      scope,
      id,
      subjectId,
      body.staffId ?? null,
    );
  }

  @Put('sections/:id/class-teacher')
  @RequirePermission('timetable.edit', 'staff.edit')
  @ApiOperation({ summary: 'Set (or remove) the class teacher of a section' })
  @ApiData(ClassTeacherRowDto)
  classTeacher(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetTeacherDto,
  ): Promise<ClassTeacherRowDto> {
    return this.allocation.setClassTeacher(
      user,
      scope,
      id,
      body.staffId ?? null,
    );
  }

  @Get('branches/:id/teaching-staff')
  @RequirePermission('classes.view')
  @ApiOperation({
    summary:
      'Teaching staff of a branch (with or without login) and their load',
  })
  @ApiData(TeachingStaffDto, { isArray: true })
  teachingStaff(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: TeachingStaffQueryDto,
  ): Promise<TeachingStaffDto[]> {
    return this.teaching.list(scope, id, query.sessionId, query.all ?? false);
  }
}
