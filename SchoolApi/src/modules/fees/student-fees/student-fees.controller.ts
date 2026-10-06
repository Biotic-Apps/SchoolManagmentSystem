import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { FeeSummaryDto, StudentLedgerDto } from './dto/student-fees.dto';
import { FeeSummaryService } from './fee-summary.service';
import { StudentLedgerService } from './student-ledger.service';

@ApiTags('fees')
@ApiBearerAuth()
@Controller('students')
export class StudentFeesController {
  constructor(
    private readonly ledger: StudentLedgerService,
    private readonly summaries: FeeSummaryService,
  ) {}

  @Get(':id/ledger')
  @RequirePermission('fees.view')
  @ApiData(StudentLedgerDto)
  getLedger(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudentLedgerDto> {
    return this.ledger.ledger(scope, id);
  }

  @Get(':id/fee-summary')
  @RequirePermission('fees.view')
  @ApiData(FeeSummaryDto)
  getSummary(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FeeSummaryDto> {
    return this.summaries.summary(scope, id);
  }
}
