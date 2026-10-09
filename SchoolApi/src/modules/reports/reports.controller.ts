import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { PermissionKey } from '../../core/rbac/permission-catalogue';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  CreateReportDto,
  ReportCatalogEntryDto,
  ReportJobDto,
  ReportStatusDto,
} from './dto/report.dto';
import { ReportsService } from './reports.service';

/** Any one of these opens the reports area; each report checks its own. */
const REPORT_ACCESS: PermissionKey[] = [
  'reports.view',
  'fees.view',
  'exams.view',
  'payroll.view',
  'expenses.view',
  'inventory.view',
  'attendance.view',
];

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('catalog')
  @RequirePermission(...REPORT_ACCESS)
  @ApiData(ReportCatalogEntryDto, { isArray: true })
  catalog(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
  ): ReportCatalogEntryDto[] {
    return this.reports.catalog(user, scope);
  }

  @Post()
  @RequirePermission(...REPORT_ACCESS)
  @ApiData(ReportJobDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateReportDto,
  ): Promise<ReportJobDto> {
    return this.reports.request(user, scope, body);
  }

  @Get(':jobId')
  @RequirePermission(...REPORT_ACCESS)
  @ApiData(ReportStatusDto)
  status(
    @CurrentUser() user: AuthUser,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ): Promise<ReportStatusDto> {
    return this.reports.status(user, jobId);
  }
}
