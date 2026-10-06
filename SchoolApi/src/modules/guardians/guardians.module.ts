import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { StudentsModule } from '../students/students.module';
import { ChildLinkRequestService } from './child-links/child-link-request.service';
import { ChildLinkHandler } from './child-links/child-link.handler';
import { ChildLinksController } from './child-links/child-links.controller';
import { ChildLinksRepository } from './child-links/child-links.repository';
import { ContactChangeHandler } from './contact-change/contact-change.handler';
import { ContactChangeService } from './contact-change/contact-change.service';
import { GuardianAccessService } from './guardian-access.service';
import { GuardianDocumentOwner } from './guardian-document.owner';
import { GuardiansController } from './guardians.controller';
import { GuardiansService } from './guardians.service';
import { StudentGuardiansController } from './links/student-guardians.controller';
import { StudentGuardiansService } from './links/student-guardians.service';

@Module({
  imports: [StudentsModule, DocumentsModule],
  controllers: [
    GuardiansController,
    StudentGuardiansController,
    ChildLinksController,
  ],
  providers: [
    GuardianAccessService,
    GuardiansService,
    StudentGuardiansService,
    ChildLinksRepository,
    ChildLinkRequestService,
    ChildLinkHandler,
    ContactChangeService,
    ContactChangeHandler,
    GuardianDocumentOwner,
  ],
})
export class GuardiansModule {}
