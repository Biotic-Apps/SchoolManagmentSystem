import {
  Body,
  Controller,
  Get,
  HttpCode,
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
import {
  ChangeSectionDto,
  WithdrawStudentDto,
} from './dto/enrollment-actions.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import {
  EnrollmentDto,
  StudentDetailDto,
  StudentSummaryDto,
} from './dto/student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { EnrollmentActionsService } from './enrollment/enrollment-actions.service';
import { StudentsService } from './students.service';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(
    private readonly students: StudentsService,
    private readonly enrollment: EnrollmentActionsService,
  ) {}

  @Get()
  @RequirePermission('students.view')
  @ApiPage(StudentSummaryDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: StudentQueryDto,
  ): Promise<PageResult<StudentSummaryDto>> {
    return this.students.list(scope, query);
  }

  @Post()
  @RequirePermission('students.add')
  @ApiData(StudentDetailDto)
  register(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: RegisterStudentDto,
  ): Promise<StudentDetailDto> {
    return this.students.register(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('students.view')
  @ApiData(StudentDetailDto)
  get(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudentDetailDto> {
    return this.students.get(user, scope, id);
  }

  @Patch(':id')
  @RequirePermission('students.edit')
  @ApiData(StudentDetailDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateStudentDto,
  ): Promise<StudentDetailDto> {
    return this.students.update(user, scope, id, body);
  }

  @Get(':id/enrollments')
  @RequirePermission('students.view')
  @ApiData(EnrollmentDto, { isArray: true })
  enrollments(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EnrollmentDto[]> {
    return this.students.enrollments(scope, id);
  }

  @Post(':id/withdraw')
  @HttpCode(200)
  @RequirePermission('students.edit')
  @ApiData(EnrollmentDto)
  withdraw(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: WithdrawStudentDto,
  ): Promise<EnrollmentDto> {
    return this.enrollment.withdraw(user, scope, id, body);
  }

  @Post(':id/change-section')
  @HttpCode(200)
  @RequirePermission('students.edit')
  @ApiData(EnrollmentDto)
  changeSection(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ChangeSectionDto,
  ): Promise<EnrollmentDto> {
    return this.enrollment.changeSection(user, scope, id, body);
  }
}
