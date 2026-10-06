import { Module } from '@nestjs/common';
import { AbsenceNotifier } from './absence-notifier';
import { AttendanceSummaryService } from './attendance-summary.service';
import { CorrectionApprovalHandler } from './corrections/correction-approval.handler';
import { CorrectionService } from './corrections/correction.service';
import { AttendanceLockProcessor } from './jobs/attendance-lock.processor';
import { RegisterAccessService } from './register-access.service';
import { RegisterSubmitAction } from './register-submit.action';
import { RegisterViewService } from './register-view.service';
import { RegisterWriter } from './register-writer';
import { RegistersController } from './registers.controller';
import { RegistersRepository } from './registers.repository';
import { RegistersService } from './registers.service';
import { StudentAttendanceService } from './student-attendance.service';

@Module({
  controllers: [RegistersController],
  providers: [
    RegistersRepository,
    RegisterAccessService,
    RegisterViewService,
    RegisterWriter,
    AbsenceNotifier,
    RegisterSubmitAction,
    RegistersService,
    CorrectionService,
    CorrectionApprovalHandler,
    StudentAttendanceService,
    AttendanceSummaryService,
    AttendanceLockProcessor,
  ],
  exports: [AttendanceSummaryService],
})
export class AttendanceModule {}
