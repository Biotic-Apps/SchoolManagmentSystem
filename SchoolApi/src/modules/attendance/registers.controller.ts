import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { AttendanceSummaryService } from './attendance-summary.service';
import { CorrectionService } from './corrections/correction.service';
import {
  BranchDateQueryDto,
  CorrectionInputDto,
  RegisterQueryDto,
  SaveRegisterDto,
  StudentAttendanceQueryDto,
  SubmitRegisterDto,
} from './dto/register-input.dto';
import {
  CorrectionDto,
  RegisterDto,
  SectionAttendanceDto,
  StudentAttendanceDto,
  UnmarkedSectionDto,
} from './dto/register.dto';
import { RegistersService } from './registers.service';
import { StudentAttendanceService } from './student-attendance.service';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
export class RegistersController {
  constructor(
    private readonly registers: RegistersService,
    private readonly corrections: CorrectionService,
    private readonly students: StudentAttendanceService,
    private readonly summaries: AttendanceSummaryService,
  ) {}

  @Get('registers')
  @RequirePermission('attendance.view')
  @ApiData(RegisterDto)
  get(
    @CurrentScope() scope: Scope,
    @Query() query: RegisterQueryDto,
  ): Promise<RegisterDto> {
    return this.registers.get(scope, query.sectionId, query.date);
  }

  @Put('registers')
  @RequirePermission('attendance.edit')
  @ApiData(RegisterDto)
  save(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: SaveRegisterDto,
  ): Promise<RegisterDto> {
    return this.registers.save(user, scope, body);
  }

  @Post('registers/submit')
  @HttpCode(200)
  @RequirePermission('attendance.submit')
  @ApiData(RegisterDto)
  submit(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: SubmitRegisterDto,
  ): Promise<RegisterDto> {
    return this.registers.submit(user, scope, body);
  }

  @Post('corrections')
  @RequirePermission('attendance.edit')
  @ApiData(CorrectionDto)
  correct(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CorrectionInputDto,
  ): Promise<CorrectionDto> {
    return this.corrections.request(user, scope, body);
  }

  @Get('students/:id')
  @RequirePermission('attendance.view')
  @ApiData(StudentAttendanceDto)
  student(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: StudentAttendanceQueryDto,
  ): Promise<StudentAttendanceDto> {
    return this.students.history(scope, id, query);
  }

  @Get('summary')
  @RequirePermission('attendance.view')
  @ApiData(SectionAttendanceDto, { isArray: true })
  summary(
    @CurrentScope() scope: Scope,
    @Query() query: BranchDateQueryDto,
  ): Promise<SectionAttendanceDto[]> {
    return this.summaries.summary(scope, query.branchId, query.date);
  }

  @Get('unmarked')
  @RequirePermission('attendance.view')
  @ApiData(UnmarkedSectionDto, { isArray: true })
  unmarked(
    @CurrentScope() scope: Scope,
    @Query() query: BranchDateQueryDto,
  ): Promise<UnmarkedSectionDto[]> {
    return this.summaries.unmarked(scope, query.branchId, query.date);
  }
}
