import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ChallanBatchService } from './challan-batch.service';
import {
  PrintChallansDto,
  PrintChallansJobDto,
} from './dto/print-challans.dto';

@ApiTags('fees')
@ApiBearerAuth()
@Controller('invoices/challans')
export class ChallanPrintController {
  constructor(private readonly batches: ChallanBatchService) {}

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
}
