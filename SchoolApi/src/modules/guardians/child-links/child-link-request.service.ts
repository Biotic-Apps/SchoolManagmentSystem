import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { maskPhone } from '../../../core/common/masking';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { AppConfigService } from '../../../config/app-config.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { OtpService } from '../../../core/otp/otp.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { fullName } from '../../students/student.mapper';
import { currentEnrollment } from '../../students/student-scope';
import type {
  ChildLinkRequestDto,
  ChildLinkStartedDto,
  RequestChildLinkDto,
} from './child-link.dto';
import { toChildLinkDto } from './child-link.mapper';
import { ChildLinksRepository } from './child-links.repository';

export interface ChildLinkPayload {
  requestId: string;
  linkId: string;
}

const NO_MATCH = 'No student matches these details';

/**
 * security.md §4: admission no + DOB + OTP to the phone already on the
 * student's record, then staff approval (CHILD_LINK).
 */
@Injectable()
export class ChildLinkRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ChildLinksRepository,
    private readonly otp: OtpService,
    private readonly approvals: ApprovalService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
    private readonly config: AppConfigService,
  ) {}

  async start(
    user: AuthUser,
    scope: Scope,
    dto: RequestChildLinkDto,
  ): Promise<ChildLinkStartedDto> {
    const student = await this.prisma.student.findFirst({
      where: {
        admissionNo: { equals: dto.admissionNo.trim(), mode: 'insensitive' },
        schoolId: scope.global ? undefined : { in: [...scope.memberSchoolIds] },
      },
      include: {
        enrollments: {
          orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        },
        guardianLinks: {
          where: { status: 'VERIFIED', isPrimary: true },
          include: { guardian: { select: { phone: true } } },
        },
      },
    });
    if (!student || student.dob.getTime() !== parseDate(dto.dob).getTime())
      throw notFound(NO_MATCH);
    const phone = student.guardianLinks[0]?.guardian.phone;
    if (!phone)
      throw conflict('The student has no registered phone; contact the school');

    const guardian = await this.guardianOf(
      user,
      student.schoolId,
      dto.relation,
    );
    const open = await this.prisma.studentGuardian.count({
      where: {
        studentId: student.id,
        guardianId: guardian.id,
        status: { in: ['VERIFIED', 'REQUESTED'] },
      },
    });
    if (open > 0) throw conflict('You are already linked or awaiting approval');
    await this.prisma.childLinkRequest.updateMany({
      where: {
        guardianId: guardian.id,
        studentId: student.id,
        status: 'OTP_PENDING',
      },
      data: { status: 'EXPIRED' },
    });

    const issued = await this.otp.issue(phone, 'CHILD_LINK', user.id);
    const request = await this.prisma.childLinkRequest.create({
      data: {
        schoolId: student.schoolId,
        branchId: currentEnrollment(student.enrollments)?.branchId,
        guardianId: guardian.id,
        studentId: student.id,
        relation: dto.relation,
        otpCodeId: issued.id,
        requestedById: user.id,
      },
    });
    await this.notifications.sendDirect({
      to: { phone },
      channel: 'SMS',
      title: 'eSchool verification code',
      body: `Your eSchool code to link ${student.firstName}'s account is ${issued.code}. It expires in 5 minutes.`,
    });
    return {
      requestId: request.id,
      maskedPhone: maskPhone(phone),
      ...(this.config.get('NODE_ENV') === 'development' && {
        devCode: issued.code,
      }),
    };
  }

  async verifyOtp(
    user: AuthUser,
    requestId: string,
    code: string,
  ): Promise<ChildLinkRequestDto> {
    const request = await this.repository.findById(requestId);
    if (!request || request.requestedById !== user.id)
      throw notFound('Link request');
    if (request.status !== 'OTP_PENDING' || !request.otpCodeId)
      throw conflict('This request is no longer waiting for a code');
    await this.otp.verify(request.otpCodeId, 'CHILD_LINK', code);

    await this.prisma.$transaction(async (tx) => {
      const link = await tx.studentGuardian
        .create({
          data: {
            schoolId: request.schoolId,
            studentId: request.studentId,
            guardianId: request.guardianId,
            relation: request.relation,
            status: 'REQUESTED',
            createdById: user.id,
          },
        })
        .catch((error: { code?: string }) => {
          if (error.code === 'P2002') throw conflict('Link already requested');
          throw error;
        });
      const payload: ChildLinkPayload = { requestId, linkId: link.id };
      const approval = await this.approvals.create(
        {
          type: 'CHILD_LINK',
          entityType: 'ChildLinkRequest',
          entityId: requestId,
          schoolId: request.schoolId,
          branchId: request.branchId,
          requestedById: user.id,
          title: `Link ${request.guardian.name} to ${fullName(request.student)}`,
          payload,
          steps: [{ approverRole: RoleKey.PRINCIPAL }],
        },
        tx,
      );
      await tx.childLinkRequest.update({
        where: { id: requestId },
        data: {
          status: 'REQUESTED',
          linkId: link.id,
          approvalRequestId: approval.id,
        },
      });
    });
    this.audit.stage({
      action: 'child_link.request',
      entityType: 'ChildLinkRequest',
      entityId: requestId,
      schoolId: request.schoolId,
      branchId: request.branchId,
      after: { studentId: request.studentId, guardianId: request.guardianId },
    });
    await this.notifyPrincipal(request.branchId, requestId);
    const row = await this.repository.findById(requestId);
    return toChildLinkDto(row!);
  }

  /** The parent's own guardian record, created from the profile on first use. */
  private async guardianOf(
    user: AuthUser,
    schoolId: string,
    relation: RequestChildLinkDto['relation'],
  ) {
    const existing = await this.prisma.guardian.findUnique({
      where: { userId: user.id },
    });
    if (existing) return existing;
    const profile = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    if (!profile.phone)
      throw invalid('Add a phone number to your profile first');
    return this.prisma.guardian.create({
      data: {
        schoolId,
        userId: user.id,
        name: profile.name,
        relation,
        phone: profile.phone,
        email: profile.email,
        createdById: user.id,
      },
    });
  }

  private async notifyPrincipal(branchId: string | null, requestId: string) {
    if (!branchId) return;
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch?.principalUserId) return;
    await this.notifications.notify({
      userIds: [branch.principalUserId],
      category: 'APPROVAL',
      title: 'Parent link request',
      body: 'A parent asked to be linked to a student.',
      data: { childLinkRequestId: requestId },
    });
  }
}
