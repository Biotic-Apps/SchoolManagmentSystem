import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { Scope } from '../../../core/rbac/scope/scope';
import { GeneratedDocumentService } from '../../generated-docs/generated-document.service';
import { ChallanSource } from '../challans/challan-source.service';
import type { InvoicePdfDto } from './dto/invoice.dto';
import { InvoiceReader } from './invoice-reader.service';

/** Challan PDF: re-rendered when anything it prints changed after the last version. */
@Injectable()
export class InvoicePdfService {
  constructor(
    private readonly reader: InvoiceReader,
    private readonly documents: GeneratedDocumentService,
    private readonly source: ChallanSource,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<InvoicePdfDto> {
    const invoice = await this.reader.read(scope, id);
    const latest = await this.documents.latest('CHALLAN', id);
    const fresh =
      !!latest &&
      latest.status === 'READY' &&
      (await this.source.changedAt(invoice)) > latest.createdAt;
    const { jobId } = await this.documents.request(user, {
      kind: 'CHALLAN',
      entityId: id,
      schoolId: invoice.schoolId,
      ownerUserId: user.id,
      fresh,
    });
    const view = this.documents.view(
      await this.documents.latest('CHALLAN', id),
    );
    return {
      jobId,
      status: view?.status ?? 'PENDING',
      fileUrl: view?.fileUrl ?? null,
    };
  }
}
