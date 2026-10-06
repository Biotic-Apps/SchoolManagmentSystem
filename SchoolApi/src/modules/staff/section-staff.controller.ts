import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { SectionStaffDto } from './dto/staff.dto';
import { WorkloadService } from './workload.service';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('sections')
export class SectionStaffController {
  constructor(private readonly workloads: WorkloadService) {}

  @Get(':id/staff')
  @RequirePermission('classes.view')
  @ApiData(SectionStaffDto)
  staff(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SectionStaffDto> {
    return this.workloads.sectionStaff(scope, id);
  }
}
