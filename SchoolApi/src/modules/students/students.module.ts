import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { EnrollmentActionsService } from './enrollment/enrollment-actions.service';
import { EnrollmentWriter } from './enrollment/enrollment-writer';
import { IdCardBulkModule } from './id-card/bulk/id-card-bulk.module';
import { IdCardController } from './id-card/id-card.controller';
import { IdCardProcessor } from './id-card/id-card.processor';
import { IdCardService } from './id-card/id-card.service';
import { GuardianWriter } from './registration/guardian-writer';
import { ParentLoginWriter } from './registration/parent-login.writer';
import { StudentRegistrationService } from './registration/student-registration.service';
import { SectionAccessService } from './section-access.service';
import { StudentAccessService } from './student-access.service';
import { StudentDocumentOwner } from './student-document.owner';
import { StudentMapper } from './student.mapper';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';
import { TransfersController } from './transfers/transfers.controller';
import { TransfersRepository } from './transfers/transfers.repository';
import { TransfersService } from './transfers/transfers.service';

@Module({
  imports: [DocumentsModule, IdCardBulkModule],
  controllers: [StudentsController, TransfersController, IdCardController],
  providers: [
    StudentsRepository,
    StudentAccessService,
    StudentMapper,
    StudentsService,
    EnrollmentWriter,
    EnrollmentActionsService,
    GuardianWriter,
    ParentLoginWriter,
    StudentRegistrationService,
    TransfersRepository,
    TransfersService,
    IdCardService,
    IdCardProcessor,
    StudentDocumentOwner,
    SectionAccessService,
  ],
  exports: [
    StudentsRepository,
    StudentAccessService,
    StudentMapper,
    StudentRegistrationService,
    GuardianWriter,
    ParentLoginWriter,
    EnrollmentWriter,
    SectionAccessService,
  ],
})
export class StudentsModule {}
