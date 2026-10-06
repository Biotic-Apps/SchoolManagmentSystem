import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { normalizePhone } from '../../../core/auth/identifier';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type {
  ContactChangeDto,
  ContactChangeResultDto,
} from '../dto/guardian-input.dto';

export interface ContactChangePayload {
  guardianId: string;
  before: { phone: string; email: string | null; address: string | null };
  after: { phone?: string; email?: string; address?: string };
}

/** backendFlows.md §3.3: contact changes apply only after approval. */
@Injectable()
export class ContactChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalService,
    private readonly audit: AuditService,
  ) {}

  async request(
    user: AuthUser,
    dto: ContactChangeDto,
  ): Promise<ContactChangeResultDto> {
    if (!dto.phone && !dto.email && !dto.address)
      throw invalid('Give at least one of phone, email or address');
    const guardian = await this.prisma.guardian.findUnique({
      where: { userId: user.id },
      include: {
        studentLinks: {
          where: { status: 'VERIFIED' },
          include: {
            student: {
              select: {
                enrollments: {
                  where: { status: 'ACTIVE' },
                  select: { branchId: true },
                },
              },
            },
          },
        },
      },
    });
    if (!guardian) throw notFound('Guardian profile');
    const branchId = guardian.studentLinks
      .flatMap((l) => l.student.enrollments)
      .map((e) => e.branchId)[0];
    if (!branchId) throw conflict('No linked student to route the request');
    const open = await this.prisma.approvalRequest.count({
      where: {
        type: 'CONTACT_CHANGE',
        entityId: guardian.id,
        status: 'PENDING',
      },
    });
    if (open > 0) throw conflict('A contact change is already pending');

    const payload: ContactChangePayload = {
      guardianId: guardian.id,
      before: {
        phone: guardian.phone,
        email: guardian.email,
        address: guardian.address,
      },
      after: {
        phone: dto.phone ? normalizePhone(dto.phone) : undefined,
        email: dto.email?.toLowerCase(),
        address: dto.address,
      },
    };
    const approval = await this.approvals.create({
      type: 'CONTACT_CHANGE',
      entityType: 'Guardian',
      entityId: guardian.id,
      schoolId: guardian.schoolId,
      branchId,
      requestedById: user.id,
      title: `Contact change: ${guardian.name}`,
      payload,
      steps: [{ approverRole: RoleKey.PRINCIPAL }],
    });
    this.audit.stage({
      action: 'guardian.contact_change_request',
      entityType: 'Guardian',
      entityId: guardian.id,
      schoolId: guardian.schoolId,
      branchId,
      after: { approvalId: approval.id, ...payload.after },
    });
    return { approvalId: approval.id, status: approval.status };
  }
}
