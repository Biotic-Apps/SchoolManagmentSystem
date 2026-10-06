import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { conflict, invalid, notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { toJson } from '../../core/common/prisma-json';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { CertificateAccessService } from './certificate-access.service';
import { CertificateNotifier } from './certificate-notifier';
import { CertificatePresenter } from './certificate-presenter';
import { CERTIFICATE_INCLUDE } from './certificate.mapper';
import type {
  CertificateQueryDto,
  CreateCertificateDto,
} from './dto/certificate-input.dto';
import type { CertificateDto } from './dto/certificate.dto';

/** Requesting, listing and reading certificates. */
@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CertificateAccessService,
    private readonly presenter: CertificatePresenter,
    private readonly notifier: CertificateNotifier,
    private readonly audit: AuditService,
  ) {}

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateCertificateDto,
  ): Promise<CertificateDto> {
    if (scope.guardian && !scope.canAccessStudent(dto.studentId)) {
      throw notFound('Student');
    }
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      select: {
        id: true,
        schoolId: true,
        enrollments: {
          orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
          take: 1,
          select: { branchId: true },
        },
      },
    });
    if (!student) throw notFound('Student');
    const branchId = student.enrollments[0]?.branchId;
    if (!branchId) throw invalid('Student has no enrollment');
    if (!scope.guardian) {
      scope.assertManageBranch({ id: branchId, schoolId: student.schoolId });
    }
    const details = await this.details(dto, student.schoolId);
    const open = await this.prisma.certificate.count({
      where: {
        studentId: student.id,
        type: dto.type,
        status: { in: ['REQUESTED', 'APPROVED'] },
      },
    });
    if (open > 0) {
      throw conflict(`An open ${dto.type} certificate request already exists`);
    }
    const row = await this.prisma.certificate.create({
      data: {
        schoolId: student.schoolId,
        branchId,
        studentId: student.id,
        type: dto.type,
        purpose: dto.purpose?.trim() || null,
        details: details ? toJson(details) : undefined,
        requestedById: user.id,
      },
      include: CERTIFICATE_INCLUDE,
    });
    this.audit.stage({
      action: 'certificate.request',
      entityType: 'Certificate',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId,
      after: { studentId: row.studentId, type: row.type, purpose: row.purpose },
    });
    await this.notifier.requested(row, user.id);
    return this.presenter.one(row);
  }

  async list(
    scope: Scope,
    query: CertificateQueryDto,
  ): Promise<PageResult<CertificateDto>> {
    scope.assertGuardianStudent(query.studentId);
    const where: Prisma.CertificateWhereInput = {
      AND: [
        scope.guardian
          ? { studentId: { in: [...scope.studentIds] } }
          : scope.branchFilter(),
        {
          branchId: query.branchId,
          type: query.type,
          status: query.status,
          studentId: query.studentId,
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where,
        include: CERTIFICATE_INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.certificate.count({ where }),
    ]);
    return toPageResult(await this.presenter.many(rows), total, query);
  }

  async get(user: AuthUser, scope: Scope, id: string): Promise<CertificateDto> {
    const row = await this.access.read(scope, id);
    return this.presenter.withDocument(user, row);
  }

  private async details(
    dto: CreateCertificateDto,
    schoolId: string,
  ): Promise<Record<string, string> | null> {
    const activityId = dto.details?.activityId;
    const achievement = dto.details?.achievement?.trim();
    if (dto.type === 'ACHIEVEMENT' && !activityId && !achievement) {
      throw invalid(
        'ACHIEVEMENT needs details.activityId or details.achievement',
      );
    }
    if (activityId) {
      const found = await this.prisma.activity.count({
        where: { id: activityId, schoolId },
      });
      if (!found) throw invalid('Unknown activity', { activityId });
    }
    const details: Record<string, string> = {};
    if (activityId) details.activityId = activityId;
    if (achievement) details.achievement = achievement;
    return Object.keys(details).length > 0 ? details : null;
  }
}
