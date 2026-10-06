import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
import { StaffAssignmentsService } from './assignments/staff-assignments.service';
import {
  AssignmentInput2Dto,
  CreateStaffDto,
  ProbationDto,
  SessionQueryDto,
  StaffQueryDto,
  StaffStatusDto,
  UpdateStaffDto,
} from './dto/staff-input.dto';
import {
  CreatedStaffDto,
  StaffAssignmentDto,
  StaffDetailDto,
  StaffSummaryDto,
  WorkloadDto,
} from './dto/staff.dto';
import { StaffStatusService } from './staff-status.service';
import { StaffService } from './staff.service';
import { WorkloadService } from './workload.service';

@ApiTags('staff')
@ApiBearerAuth()
@Controller('staff')
export class StaffController {
  constructor(
    private readonly staff: StaffService,
    private readonly status: StaffStatusService,
    private readonly assignments: StaffAssignmentsService,
    private readonly workloads: WorkloadService,
  ) {}

  @Get()
  @RequirePermission('staff.view')
  @ApiPage(StaffSummaryDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: StaffQueryDto,
  ): Promise<PageResult<StaffSummaryDto>> {
    return this.staff.list(scope, query);
  }

  @Post()
  @RequirePermission('staff.add')
  @ApiData(CreatedStaffDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateStaffDto,
  ): Promise<CreatedStaffDto> {
    return this.staff.create(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('staff.view')
  @ApiData(StaffDetailDto)
  get(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StaffDetailDto> {
    return this.staff.get(user, scope, id);
  }

  @Patch(':id')
  @RequirePermission('staff.edit')
  @ApiData(StaffDetailDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateStaffDto,
  ): Promise<StaffDetailDto> {
    return this.staff.update(user, scope, id, body);
  }

  @Post(':id/status')
  @HttpCode(200)
  @RequirePermission('staff.edit')
  @ApiData(StaffDetailDto)
  setStatus(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: StaffStatusDto,
  ): Promise<StaffDetailDto> {
    return this.status.setStatus(user, scope, id, body);
  }

  @Put(':id/probation')
  @RequirePermission('staff.edit')
  @ApiData(StaffDetailDto)
  setProbation(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ProbationDto,
  ): Promise<StaffDetailDto> {
    return this.status.setProbation(user, scope, id, body);
  }

  @Get(':id/assignments')
  @RequirePermission('staff.view')
  @ApiData(StaffAssignmentDto, { isArray: true })
  listAssignments(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SessionQueryDto,
  ): Promise<StaffAssignmentDto[]> {
    return this.assignments.list(scope, id, query.sessionId);
  }

  @Post(':id/assignments')
  @RequirePermission('staff.edit')
  @ApiData(StaffAssignmentDto)
  addAssignment(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AssignmentInput2Dto,
  ): Promise<StaffAssignmentDto> {
    return this.assignments.add(user, scope, id, body);
  }

  @Delete(':id/assignments/:assignmentId')
  @RequirePermission('staff.edit')
  @ApiData(StaffAssignmentDto)
  endAssignment(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ): Promise<StaffAssignmentDto> {
    return this.assignments.end(user, scope, id, assignmentId);
  }

  @Get(':id/workload')
  @RequirePermission('staff.view')
  @ApiData(WorkloadDto)
  workload(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SessionQueryDto,
  ): Promise<WorkloadDto> {
    return this.workloads.workload(scope, id, query.sessionId);
  }
}
