import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { UrlSigner } from '../../../core/files/url-signer';
import { OutboxService } from '../../../core/outbox/outbox.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { StudentAccessService } from '../student-access.service';
import type { IdCardJobDto, IdCardStatusDto } from './id-card.dto';
import { queueIdCard } from './id-card-job';

@Injectable()
export class IdCardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: StudentAccessService,
    private readonly outbox: OutboxService,
    private readonly signer: UrlSigner,
    private readonly audit: AuditService,
  ) {}

  /** A reprint is a new version; a card still rendering is reused. */
  async request(
    user: AuthUser,
    scope: Scope,
    studentId: string,
  ): Promise<IdCardJobDto> {
    const student = await this.access.read(scope, studentId);
    const pending = await this.prisma.idCard.findFirst({
      where: { studentId, status: 'PENDING' },
      orderBy: { version: 'desc' },
    });
    if (pending) return { jobId: pending.id };

    const queued = await this.prisma.$transaction((tx) =>
      queueIdCard(tx, this.outbox, {
        schoolId: student.schoolId,
        studentId,
        requestedById: user.id,
      }),
    );
    await this.outbox.publish([queued.outboxId]);
    this.audit.stage({
      action: 'student.id_card_request',
      entityType: 'Student',
      entityId: studentId,
      schoolId: student.schoolId,
      after: { idCardId: queued.idCardId },
    });
    return { jobId: queued.idCardId };
  }

  async status(scope: Scope, studentId: string): Promise<IdCardStatusDto> {
    await this.access.read(scope, studentId);
    const card = await this.prisma.idCard.findFirst({
      where: { studentId },
      orderBy: { version: 'desc' },
    });
    if (!card) throw notFound('ID card');
    return {
      status: card.status,
      fileUrl: card.fileId ? this.signer.sign(card.fileId).url : null,
      version: card.version,
      generatedAt: card.generatedAt?.toISOString() ?? null,
    };
  }
}
