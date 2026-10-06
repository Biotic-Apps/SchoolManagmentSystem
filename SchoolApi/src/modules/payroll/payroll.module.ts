import { Module } from '@nestjs/common';
import { AdjustmentsController } from './adjustments/adjustments.controller';
import { AdjustmentsService } from './adjustments/adjustments.service';
import { PayrollPayslipsProcessor } from './approval/jobs/payroll-payslips.processor';
import {
  PayrollLinesApprovalHandler,
  PayrollRunApprovalHandler,
} from './approval/payroll-approval.handler';
import { PayrollApproveService } from './approval/payroll-approve.service';
import { PayrollFinalizer } from './approval/payroll-finalizer';
import { PayrollCalculateProcessor } from './calculation/jobs/payroll-calculate.processor';
import { PayrollCalculationService } from './calculation/payroll-calculation.service';
import { PayrollInputsService } from './calculation/payroll-inputs.service';
import { PayrollAccess } from './payroll-access.service';
import { PayrollPaymentsService } from './payments/payroll-payments.service';
import { PayslipRenderer } from './payslips/payslip.renderer';
import { PayslipsController } from './payslips/payslips.controller';
import { PayslipsService } from './payslips/payslips.service';
import { RunViewService } from './runs/run-view.service';
import { RunWorkflowService } from './runs/run-workflow.service';
import { RunsController } from './runs/runs.controller';
import { RunsService } from './runs/runs.service';
import { SalaryStructureController } from './structures/salary-structure.controller';
import { SalaryStructureService } from './structures/salary-structure.service';

/** Phase 4 §C: salary structures, adjustments, runs, approval, payments, payslips. */
@Module({
  controllers: [
    SalaryStructureController,
    AdjustmentsController,
    RunsController,
    PayslipsController,
  ],
  providers: [
    PayrollAccess,
    SalaryStructureService,
    AdjustmentsService,
    RunsService,
    RunViewService,
    RunWorkflowService,
    PayrollInputsService,
    PayrollCalculationService,
    PayrollCalculateProcessor,
    PayrollApproveService,
    PayrollFinalizer,
    PayrollRunApprovalHandler,
    PayrollLinesApprovalHandler,
    PayrollPayslipsProcessor,
    PayrollPaymentsService,
    PayslipsService,
    PayslipRenderer,
  ],
})
export class PayrollModule {}
