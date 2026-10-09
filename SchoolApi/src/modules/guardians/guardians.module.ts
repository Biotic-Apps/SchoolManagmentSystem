import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { GuardianAccountController } from './account/guardian-account.controller';
import { GuardianAccountService } from './account/guardian-account.service';
import { IdCardBulkModule } from '../students/id-card/bulk/id-card-bulk.module';
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
import { LoginSlipCredentials } from './login-slips/login-slip-credentials';
import { LoginSlipPlanReader } from './login-slips/login-slip-plan.reader';
import { LoginSlipsController } from './login-slips/login-slips.controller';
import { LoginSlipsProcessor } from './login-slips/login-slips.processor';
import { LoginSlipsService } from './login-slips/login-slips.service';
import { SchoolLogoReader } from './login-slips/school-logo.reader';
import { StudentGuardiansController } from './links/student-guardians.controller';
import { StudentGuardiansService } from './links/student-guardians.service';

@Module({
  imports: [StudentsModule, DocumentsModule, IdCardBulkModule],
  controllers: [
    GuardiansController,
    StudentGuardiansController,
    ChildLinksController,
    GuardianAccountController,
    LoginSlipsController,
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
    GuardianAccountService,
    LoginSlipsService,
    LoginSlipPlanReader,
    LoginSlipCredentials,
    LoginSlipsProcessor,
    SchoolLogoReader,
  ],
})
export class GuardiansModule {}
