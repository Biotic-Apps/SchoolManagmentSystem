import { Module } from '@nestjs/common';
import { CertificateAccessService } from './certificate-access.service';
import { CertificateContentLoader } from './certificate-content.loader';
import { CertificateIssueService } from './certificate-issue.service';
import { CertificateNotifier } from './certificate-notifier';
import { CertificatePdfRequester } from './certificate-pdf-requester';
import { CertificatePresenter } from './certificate-presenter';
import { CertificateReviewService } from './certificate-review.service';
import { CertificateVerifyController } from './certificate-verify.controller';
import { CertificateWithdrawal } from './certificate-withdrawal';
import { CertificateRenderer } from './certificate.renderer';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { ClearanceService } from './clearance.service';

/** §F certificates: request → approve (clearance) → issue (serial, PDF, QR). */
@Module({
  controllers: [CertificateVerifyController, CertificatesController],
  providers: [
    CertificatesService,
    CertificateAccessService,
    CertificatePresenter,
    CertificateNotifier,
    CertificateReviewService,
    CertificateIssueService,
    CertificatePdfRequester,
    CertificateWithdrawal,
    ClearanceService,
    CertificateContentLoader,
    CertificateRenderer,
  ],
})
export class CertificatesModule {}
