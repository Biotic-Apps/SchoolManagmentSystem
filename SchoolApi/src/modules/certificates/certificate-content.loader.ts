import { Injectable } from '@nestjs/common';
import type { Certificate, Student } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import { PrismaService } from '../../core/prisma/prisma.service';
import { fullName } from '../students/student.mapper';
import type { CertificateContent } from './certificate-text';

export interface LoadedCertificate {
  schoolName: string;
  branchLine: string;
  content: CertificateContent;
}

/** Everything the certificate PDF prints besides the certificate row. */
@Injectable()
export class CertificateContentLoader {
  constructor(private readonly prisma: PrismaService) {}

  async load(
    cert: Certificate & { student: Student },
  ): Promise<LoadedCertificate> {
    const [branch, enrollment, guardian] = await Promise.all([
      this.prisma.branch.findUniqueOrThrow({
        where: { id: cert.branchId },
        include: { school: { select: { name: true } } },
      }),
      this.prisma.enrollment.findFirst({
        where: { studentId: cert.studentId, branchId: cert.branchId },
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        include: {
          session: { select: { name: true } },
          section: {
            select: { name: true, schoolClass: { select: { name: true } } },
          },
        },
      }),
      this.prisma.studentGuardian.findFirst({
        where: { studentId: cert.studentId, status: 'VERIFIED' },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        select: { guardian: { select: { name: true } } },
      }),
    ]);
    const details = (cert.details ?? {}) as {
      activityId?: string;
      achievement?: string;
    };
    const leaving = cert.effectiveDate ?? enrollment?.endDate ?? null;
    return {
      schoolName: branch.school.name,
      branchLine: [branch.name, branch.address, branch.phone]
        .filter(Boolean)
        .join(' · '),
      content: {
        type: cert.type,
        studentName: fullName(cert.student),
        gender: cert.student.gender,
        guardianName: guardian?.guardian.name ?? null,
        admissionNo: cert.student.admissionNo,
        className: enrollment
          ? `${enrollment.section.schoolClass.name} ${enrollment.section.name}`
          : null,
        sessionName: enrollment?.session.name ?? null,
        admissionDate: formatDate(cert.student.admissionDate),
        leavingDate:
          cert.type === 'SCHOOL_LEAVING' && leaving
            ? formatDate(leaving)
            : null,
        purpose: cert.purpose,
        achievement: await this.achievement(details),
        attendance:
          cert.type === 'ATTENDANCE' && enrollment
            ? await this.attendance(cert.studentId, enrollment.sessionId)
            : null,
      },
    };
  }

  private async achievement(details: {
    activityId?: string;
    achievement?: string;
  }): Promise<string | null> {
    const activity = details.activityId
      ? await this.prisma.activity.findUnique({
          where: { id: details.activityId },
          select: { title: true },
        })
      : null;
    const parts = [details.achievement, activity?.title].filter(
      (p): p is string => !!p,
    );
    return parts.length > 0 ? parts.join(' — ') : null;
  }

  private async attendance(
    studentId: string,
    sessionId: string,
  ): Promise<{ present: number; total: number }> {
    const rows = await this.prisma.attendanceEntry.groupBy({
      by: ['status'],
      where: {
        studentId,
        status: { not: 'LEAVE' },
        register: { sessionId, status: { in: ['SUBMITTED', 'LOCKED'] } },
      },
      _count: { _all: true },
    });
    let present = 0;
    let total = 0;
    for (const row of rows) {
      total += row._count._all;
      if (row.status !== 'ABSENT') present += row._count._all;
    }
    return { present, total };
  }
}
