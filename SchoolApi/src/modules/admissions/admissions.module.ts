import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { StudentsModule } from '../students/students.module';
import { AdmissionConfirmService } from './admission-confirm.service';
import { ApplicantNotifier } from './applicant-notifier';
import { ApplicationAccessService } from './application-access.service';
import { ApplicationDocumentOwner } from './application-document.owner';
import { ApplicationWorkflowService } from './application-workflow.service';
import { ApplicationsController } from './applications.controller';
import { ApplicationsRepository } from './applications.repository';
import { ApplicationsService } from './applications.service';
import { EnquiriesController } from './enquiries.controller';
import { EnquiriesService } from './enquiries.service';
import { WaitingListController } from './waiting-list.controller';

@Module({
  imports: [StudentsModule, DocumentsModule],
  controllers: [
    EnquiriesController,
    ApplicationsController,
    WaitingListController,
  ],
  providers: [
    ApplicationsRepository,
    ApplicationAccessService,
    ApplicationsService,
    ApplicationWorkflowService,
    AdmissionConfirmService,
    ApplicantNotifier,
    EnquiriesService,
    ApplicationDocumentOwner,
  ],
})
export class AdmissionsModule {}
