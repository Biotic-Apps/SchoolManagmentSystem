import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { UsersModule } from '../users/users.module';
import { StaffAccountController } from './account/staff-account.controller';
import { StaffAccountService } from './account/staff-account.service';
import { AllocationTarget } from './allocation/allocation-target';
import { AllocationController } from './allocation/allocation.controller';
import { AllocationService } from './allocation/allocation.service';
import { TeachingStaffService } from './allocation/teaching-staff.service';
import { AssignmentEnder } from './assignments/assignment-ender';
import { StaffAssignmentsService } from './assignments/staff-assignments.service';
import { StaffIdCardBulkModule } from './id-card/bulk/staff-id-card-bulk.module';
import { StaffIdCardContentLoader } from './id-card/staff-id-card-content.loader';
import { StaffIdCardController } from './id-card/staff-id-card.controller';
import { StaffIdCardProcessor } from './id-card/staff-id-card.processor';
import { StaffIdCardService } from './id-card/staff-id-card.service';
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
  imports: [DocumentsModule, UsersModule, StaffIdCardBulkModule],
  controllers: [
    StaffController,
    StaffAccountController,
    SectionStaffController,
    AllocationController,
    StaffIdCardController,
  ],
  providers: [
    StaffRepository,
    StaffAccessService,
    StaffMapper,
    StaffService,
    StaffAccountService,
    StaffStatusService,
    AssignmentEnder,
    StaffAssignmentsService,
    WorkloadService,
    ExpireAssignmentsProcessor,
    StaffDocumentOwner,
    AllocationTarget,
    AllocationService,
    TeachingStaffService,
    StaffIdCardService,
    StaffIdCardProcessor,
    StaffIdCardContentLoader,
  ],
  exports: [StaffRepository, StaffAccessService, AssignmentEnder, AllocationService],
})
export class StaffModule {}
