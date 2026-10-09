import { Module } from '@nestjs/common';
import { AdjustmentsController } from './adjustments/adjustments.controller';
import { AdjustmentCancelService } from './adjustments/adjustment-cancel.service';
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
import { OvertimeSyncService } from './overtime/overtime-sync.service';
import { OvertimeController } from './overtime/overtime.controller';
import { OvertimeService } from './overtime/overtime.service';
import { PayrollAccess } from './payroll-access.service';
import { PayrollPaymentsService } from './payments/payroll-payments.service';
import { PayslipRenderer } from './payslips/payslip.renderer';
import { PayslipsController } from './payslips/payslips.controller';
import { PayslipsService } from './payslips/payslips.service';
import { RunPayslipsService } from './payslips/run-payslips.service';
import { RunViewService } from './runs/run-view.service';
import { RunWorkflowService } from './runs/run-workflow.service';
import { RunsController } from './runs/runs.controller';
import { RunsService } from './runs/runs.service';
import { SalaryStructureController } from './structures/salary-structure.controller';
import { SalaryStructureService } from './structures/salary-structure.service';
import { PayrollSettingsController } from './settings/payroll-settings.controller';
import { PayrollSettingsService } from './settings/payroll-settings.service';
import { PayrollStaffController } from './staff-setup/payroll-staff.controller';
import { PayrollStaffService } from './staff-setup/payroll-staff.service';

/** Phase 4 §C: salary structures, adjustments, overtime, rules, runs, approval, payments, payslips. */
@Module({
  controllers: [
    SalaryStructureController,
    AdjustmentsController,
    RunsController,
    PayslipsController,
    PayrollSettingsController,
    OvertimeController,
    PayrollStaffController,
  ],
  providers: [
    PayrollAccess,
    SalaryStructureService,
    AdjustmentsService,
    AdjustmentCancelService,
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
    RunPayslipsService,
    PayrollSettingsService,
    OvertimeService,
    OvertimeSyncService,
    PayrollStaffService,
  ],
})
export class PayrollModule {}
