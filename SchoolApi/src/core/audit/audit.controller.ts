import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { PageResult } from '../common/pagination/page-result';
import { ApiPage } from '../common/swagger/api-data.decorator';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { CurrentScope } from '../rbac/scope/current-scope.decorator';
import type { Scope } from '../rbac/scope/scope';
import { AuditQueryService } from './audit-query.service';
import { AuditLogDto } from './dto/audit-log.dto';
import { AuditQueryDto } from './dto/audit-query.dto';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditQueryService) {}

  @Get()
  @RequirePermission('audit.view')
  @ApiPage(AuditLogDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: AuditQueryDto,
  ): Promise<PageResult<AuditLogDto>> {
    return this.audit.list(scope, query);
  }
}
