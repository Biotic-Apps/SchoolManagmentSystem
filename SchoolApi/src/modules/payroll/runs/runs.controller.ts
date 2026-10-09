import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  ApiData,
  ApiPage,
} from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { PayrollApproveService } from '../approval/payroll-approve.service';
import { CreatePayrollPaymentDto } from '../payments/dto/payroll-payment.dto';
import { PayrollPaymentsService } from '../payments/payroll-payments.service';
import { RunPayslipsService } from '../payslips/run-payslips.service';
import {
  CreateRunDto,
  PayrollJobDto,
  PayrollRunDto,
  RunQueryDto,
} from './dto/run.dto';
import { RunWorkflowService } from './run-workflow.service';
import { RunsService } from './runs.service';

@ApiTags('payroll')
@ApiBearerAuth()
@Controller('payroll/runs')
export class RunsController {
  constructor(
    private readonly runs: RunsService,
    private readonly workflow: RunWorkflowService,
    private readonly approval: PayrollApproveService,
    private readonly payments: PayrollPaymentsService,
    private readonly slips: RunPayslipsService,
  ) {}

  @Post()
  @RequirePermission('payroll.add')
  @ApiData(PayrollRunDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateRunDto,
  ): Promise<PayrollRunDto> {
    return this.runs.create(user, scope, body);
  }

  @Get()
  @RequirePermission('payroll.view')
  @ApiPage(PayrollRunDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: RunQueryDto,
  ): Promise<PageResult<PayrollRunDto>> {
    return this.runs.list(scope, query);
  }

  @Get(':id')
  @RequirePermission('payroll.view')
  @ApiData(PayrollRunDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PayrollRunDto> {
    return this.runs.get(scope, id);
  }

  /** Every payslip of the run in one PDF (drafts are watermarked). */
  @Get(':id/payslips-pdf')
  @RequirePermission('payroll.view')
  async payslipsPdf(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StreamableFile> {
    const file = await this.slips.pdf(scope, id);
    return new StreamableFile(file.buffer, {
      type: 'application/pdf',
      length: file.buffer.length,
      disposition: `attachment; filename="${file.fileName}"`,
    });
  }

  /** Queues `payroll.calculate`; poll `GET /jobs/:id`. */
  @Post(':id/calculate')
  @HttpCode(200)
  @RequirePermission('payroll.edit')
  @ApiData(PayrollJobDto)
  calculate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PayrollJobDto> {
    return this.workflow.calculate(user, scope, id);
  }

  @Post(':id/review')
  @HttpCode(200)
  @RequirePermission('payroll.edit')
  @ApiData(PayrollRunDto)
  review(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PayrollRunDto> {
    return this.workflow.review(user, scope, id);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermission('payroll.approve')
  @ApiData(PayrollRunDto)
  approve(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PayrollRunDto> {
    return this.approval.approve(user, scope, id);
  }

  @Post(':id/payments')
  @RequirePermission('payroll.edit')
  @ApiData(PayrollRunDto)
  pay(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreatePayrollPaymentDto,
  ): Promise<PayrollRunDto> {
    return this.payments.pay(user, scope, id, body);
  }

  @Post(':id/close')
  @HttpCode(200)
  @RequirePermission('payroll.approve')
  @ApiData(PayrollRunDto)
  close(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PayrollRunDto> {
    return this.workflow.close(user, scope, id);
  }
}
