import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../core/approvals/approval.service';
import { conflict, forbidden } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';
import { BranchSettingsReader } from '../branches/settings/branch-settings.reader';
import type { NoticeDto } from './dto/notice.dto';
import { NoticePublisher } from './notice-publisher.service';
import { NoticesService } from './notices.service';

/** Publish now (notices.publish) or route a teacher's notice for approval. */
@Injectable()
export class NoticeWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notices: NoticesService,
    private readonly publisher: NoticePublisher,
    private readonly approvals: ApprovalService,
    private readonly settings: BranchSettingsReader,
  ) {}

  async publish(user: AuthUser, scope: Scope, id: string): Promise<NoticeDto> {
    const notice = await this.notices.load(user, id);
    if (notice.status !== 'DRAFT')
      throw conflict(`Notice is ${notice.status}; only DRAFT can be published`);
    const publisher =
      user.permissions.has('notices.publish') &&
      this.notices.canManage(scope, notice);
    if (!publisher) {
      if (notice.authorId !== user.id)
        throw forbidden('Only the author can submit the notice');
      const needsApproval = notice.branchId
        ? await this.settings.get<boolean>(
            notice.branchId,
            'notices.requireApproval',
          )
        : true;
      if (needsApproval) return this.submit(user, id, notice);
    }
    const recipients = await this.prisma.$transaction((tx) =>
      this.publisher.publish(id, user.id, tx),
    );
    return this.notices.done(user, 'notice.publish', id, {
      status: notice.status,
      recipients,
    });
  }

  private async submit(
    user: AuthUser,
    id: string,
    notice: { schoolId: string; branchId: string | null; title: string },
  ): Promise<NoticeDto> {
    await this.prisma.$transaction(async (tx) => {
      const approval = await this.approvals.create(
        {
          type: 'NOTICE',
          entityType: 'Notice',
          entityId: id,
          schoolId: notice.schoolId,
          branchId: notice.branchId,
          requestedById: user.id,
          title: `Notice: ${notice.title}`,
          payload: { noticeId: id },
          steps: [{ approverRole: RoleKey.PRINCIPAL }],
        },
        tx,
      );
      await tx.notice.update({
        where: { id },
        data: { status: 'PENDING_APPROVAL', approvalId: approval.id },
      });
    });
    return this.notices.done(user, 'notice.submit', id, { status: 'DRAFT' });
  }
}
