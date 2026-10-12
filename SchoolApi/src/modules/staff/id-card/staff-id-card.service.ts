import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { UrlSigner } from '../../../core/files/url-signer';
import { OutboxService } from '../../../core/outbox/outbox.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { StaffAccessService } from '../staff-access.service';
import type { StaffIdCardJobDto, StaffIdCardStatusDto } from './staff-id-card.dto';
import { queueStaffIdCard } from './staff-id-card-job';

@Injectable()
export class StaffIdCardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: StaffAccessService,
    private readonly outbox: OutboxService,
    private readonly signer: UrlSigner,
    private readonly audit: AuditService,
  ) {}

  /** A reprint is a new version; a card still rendering is reused. */
  async request(
    user: AuthUser,
    scope: Scope,
    staffId: string,
  ): Promise<StaffIdCardJobDto> {
    const staff = await this.access.manage(scope, staffId);
    const pending = await this.prisma.staffIdCard.findFirst({
      where: { staffId, status: 'PENDING' },
      orderBy: { version: 'desc' },
    });
    if (pending) return { jobId: pending.id };

    const queued = await this.prisma.$transaction((tx) =>
      queueStaffIdCard(tx, this.outbox, {
        schoolId: staff.schoolId,
        staffId,
        requestedById: user.id,
      }),
    );
    await this.outbox.publish([queued.outboxId]);
    this.audit.stage({
      action: 'staff.id_card_request',
      entityType: 'Staff',
      entityId: staffId,
      schoolId: staff.schoolId,
      after: { idCardId: queued.idCardId },
    });
    return { jobId: queued.idCardId };
  }

  async status(scope: Scope, staffId: string): Promise<StaffIdCardStatusDto> {
    await this.access.read(scope, staffId);
    const card = await this.prisma.staffIdCard.findFirst({
      where: { staffId },
      orderBy: { version: 'desc' },
    });
    if (!card) throw notFound('Staff ID card');
    return {
      status: card.status,
      fileUrl: card.fileId ? this.signer.sign(card.fileId).url : null,
      version: card.version,
      generatedAt: card.generatedAt?.toISOString() ?? null,
    };
  }
}
