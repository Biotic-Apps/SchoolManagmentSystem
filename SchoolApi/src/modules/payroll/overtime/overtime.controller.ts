import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { PayrollAccess } from '../payroll-access.service';
import {
  CreateOvertimeDto,
  DecideOvertimeDto,
  OvertimeListDto,
  OvertimeMonthDto,
  OvertimeQueryDto,
  OvertimeSyncResultDto,
} from './dto/overtime.dto';
import { OvertimeSyncService } from './overtime-sync.service';
import { OvertimeService } from './overtime.service';

@ApiTags('payroll')
@ApiBearerAuth()
@Controller('payroll/overtime')
export class OvertimeController {
  constructor(
    private readonly overtime: OvertimeService,
    private readonly finder: OvertimeSyncService,
    private readonly access: PayrollAccess,
  ) {}

  @Get()
  @RequirePermission('payroll.view')
  @ApiData(OvertimeListDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: OvertimeQueryDto,
  ): Promise<OvertimeListDto> {
    return this.overtime.list(scope, query);
  }

  /** Hand-entered overtime (e.g. an event); waits for approval like the rest. */
  @Post()
  @RequirePermission('payroll.edit')
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateOvertimeDto,
  ): Promise<{ id: string }> {
    return this.overtime.create(user, scope, body);
  }

  /** Re-reads staff attendance check-outs of the month into pending entries. */
  @Post('scan')
  @HttpCode(200)
  @RequirePermission('payroll.view')
  @ApiData(OvertimeSyncResultDto)
  async scan(
    @CurrentScope() scope: Scope,
    @Body() body: OvertimeMonthDto,
  ): Promise<OvertimeSyncResultDto> {
    const branch = await this.access.branch(scope, body.branchId);
    await this.overtime.assertOpen(branch.id, body.month);
    return this.finder.sync(branch.id, body.month);
  }

  @Post('decide')
  @HttpCode(200)
  @RequirePermission('payroll.approve')
  decide(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: DecideOvertimeDto,
  ): Promise<{ updated: number }> {
    return this.overtime.decide(user, scope, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermission('payroll.edit')
  async remove(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.overtime.remove(scope, id);
  }
}
