import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ChallanBatchService } from './challan-batch.service';
import { FamilyChallanDto } from './dto/family-challan.dto';
import {
  PrintChallansDto,
  PrintChallansJobDto,
} from './dto/print-challans.dto';
import { FamilyChallanService } from './family-challan.service';

@ApiTags('fees')
@ApiBearerAuth()
@Controller('invoices/challans')
export class ChallanPrintController {
  constructor(
    private readonly batches: ChallanBatchService,
    private readonly family: FamilyChallanService,
  ) {}

  /** One PDF of bank challans (3 copies each); poll `GET /jobs/:id` for the file. */
  @Post('print')
  @HttpCode(200)
  @RequirePermission('fees.view')
  @ApiData(PrintChallansJobDto)
  print(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: PrintChallansDto,
  ): Promise<PrintChallansJobDto> {
    return this.batches.request(user, scope, body);
  }

  /** Combined PDF of all open challans for a guardian's children (family challan). */
  @Post('family')
  @HttpCode(200)
  @RequirePermission('fees.view')
  async familyChallan(
    @CurrentScope() scope: Scope,
    @Body() body: FamilyChallanDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = body.guardianId
      ? await this.family.forGuardian(scope, body.guardianId, body.branchId)
      : await this.family.forStudents(scope, body.studentIds ?? [], body.branchId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${result.fileName}"`);
    res.end(result.buffer);
  }
}
