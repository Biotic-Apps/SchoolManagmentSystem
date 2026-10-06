import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  MyStaffAttendanceDto,
  MyStaffAttendanceQueryDto,
  SaveStaffAttendanceDto,
  StaffAttendanceDayDto,
  StaffAttendanceQueryDto,
} from './dto/staff-attendance.dto';
import { StaffAttendanceService } from './staff-attendance.service';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(private readonly attendance: StaffAttendanceService) {}

  @Get()
  @RequirePermission('attendance.view')
  @ApiData(StaffAttendanceDayDto)
  day(
    @CurrentScope() scope: Scope,
    @Query() query: StaffAttendanceQueryDto,
  ): Promise<StaffAttendanceDayDto> {
    return this.attendance.day(scope, query.branchId, query.date);
  }

  @Put()
  @RequirePermission('attendance.approve')
  @ApiData(StaffAttendanceDayDto)
  save(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: SaveStaffAttendanceDto,
  ): Promise<StaffAttendanceDayDto> {
    return this.attendance.save(user, scope, body);
  }

  @Get('me')
  @ApiData(MyStaffAttendanceDto)
  mine(
    @CurrentUser() user: AuthUser,
    @Query() query: MyStaffAttendanceQueryDto,
  ): Promise<MyStaffAttendanceDto> {
    return this.attendance.mine(user, query);
  }
}
