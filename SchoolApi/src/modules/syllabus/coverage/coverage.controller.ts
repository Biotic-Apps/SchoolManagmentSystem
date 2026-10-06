import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CoverageQueryDto, CoverageRowDto } from '../dto/syllabus.dto';
import { CoverageService } from './coverage.service';

@ApiTags('syllabus')
@ApiBearerAuth()
@Controller('syllabus/coverage')
export class CoverageController {
  constructor(private readonly coverage: CoverageService) {}

  @Get()
  @RequirePermission('syllabus.view')
  @ApiData(CoverageRowDto, { isArray: true })
  get(
    @CurrentScope() scope: Scope,
    @Query() query: CoverageQueryDto,
  ): Promise<CoverageRowDto[]> {
    return this.coverage.coverage(scope, query);
  }
}
