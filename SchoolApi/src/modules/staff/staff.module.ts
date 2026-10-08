import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { AllocationTarget } from './allocation/allocation-target';
import { AllocationController } from './allocation/allocation.controller';
import { AllocationService } from './allocation/allocation.service';
import { TeachingStaffService } from './allocation/teaching-staff.service';
import { AssignmentEnder } from './assignments/assignment-ender';
import { StaffAssignmentsService } from './assignments/staff-assignments.service';
import { ExpireAssignmentsProcessor } from './jobs/expire-assignments.processor';
import { SectionStaffController } from './section-staff.controller';
import { StaffAccessService } from './staff-access.service';
import { StaffDocumentOwner } from './staff-document.owner';
import { StaffController } from './staff.controller';
import { StaffMapper } from './staff.mapper';
import { StaffRepository } from './staff.repository';
import { StaffService } from './staff.service';
import { StaffStatusService } from './staff-status.service';
import { WorkloadService } from './workload.service';

@Module({
  imports: [DocumentsModule],
  controllers: [StaffController, SectionStaffController, AllocationController],
  providers: [
    StaffRepository,
    StaffAccessService,
    StaffMapper,
    StaffService,
    StaffStatusService,
    AssignmentEnder,
    StaffAssignmentsService,
    WorkloadService,
    ExpireAssignmentsProcessor,
    StaffDocumentOwner,
    AllocationTarget,
    AllocationService,
    TeachingStaffService,
  ],
  exports: [StaffRepository, AssignmentEnder, AllocationService],
})
export class StaffModule {}
