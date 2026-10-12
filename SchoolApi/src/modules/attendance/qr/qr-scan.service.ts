import { Injectable } from '@nestjs/common';
import type { QrResolvedType, QrScanResult } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { UrlSigner } from '../../../core/files/url-signer';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { Scope } from '../../../core/rbac/scope/scope';
import { today } from '../../../core/common/week';
import { fullName } from '../../students/student.mapper';
import { currentEnrollment } from '../../students/student-scope';
import type { QrScanInputDto, QrScanLogDto, QrScanResultDto } from './qr-scan.dto';

@Injectable()
export class QrScanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly signer: UrlSigner,
    private readonly audit: AuditService,
  ) {}

  async scan(
    user: AuthUser,
    scope: Scope,
    dto: QrScanInputDto,
  ): Promise<QrScanResultDto> {
    const schoolIds = scope.global ? null : [...scope.memberSchoolIds];
    const now = new Date();
    const dateToday = today();

    // Try to find as student first
    const student = await this.prisma.student.findFirst({
      where: {
        id: dto.publicId,
        status: 'ACTIVE',
        ...(schoolIds ? { schoolId: { in: schoolIds } } : {}),
      },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            section: {
              select: {
                id: true,
                branchId: true,
                schoolClass: { select: { name: true } },
                name: true,
              },
            },
          },
          orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (student) {
      const enrollment = currentEnrollment(student.enrollments);
      const classLabel = enrollment
        ? `${enrollment.section.schoolClass.name} - ${enrollment.section.name}`
        : null;

      // Check if already marked today
      const existingEntry = await this.prisma.attendanceEntry.findFirst({
        where: {
          studentId: student.id,
          register: { date: dateToday },
        },
      });

      let result: QrScanResult;
      if (existingEntry) {
        result = 'ALREADY_MARKED';
      } else {
        // Find or create the register for the section, then mark PRESENT
        if (enrollment) {
          const register = await this.prisma.attendanceRegister.upsert({
            where: {
              sectionId_date: {
                sectionId: enrollment.sectionId,
                date: dateToday,
              },
            },
            create: {
              schoolId: student.schoolId,
              branchId: enrollment.section.branchId,
              sessionId: enrollment.sessionId,
              sectionId: enrollment.sectionId,
              date: dateToday,
              createdById: user.id,
              updatedById: user.id,
            },
            update: {},
          });
          await this.prisma.attendanceEntry.upsert({
            where: {
              registerId_studentId: {
                registerId: register.id,
                studentId: student.id,
              },
            },
            create: {
              registerId: register.id,
              studentId: student.id,
              status: 'PRESENT',
            },
            update: { status: 'PRESENT' },
          });
          result = 'MARKED';
        } else {
          result = 'NOT_FOUND';
        }
      }

      await this.logScan(
        student.schoolId,
        user.id,
        dto.publicId,
        'STUDENT',
        student.id,
        result,
      );

      this.audit.stage({
        action: 'attendance.qr_scan',
        entityType: 'QrScanLog',
        entityId: student.id,
        schoolId: student.schoolId,
        branchId: enrollment?.section.branchId ?? null,
        after: { resolvedType: 'STUDENT', result },
      });

      return {
        result,
        resolvedType: 'STUDENT',
        name: fullName(student),
        photoUrl: student.photoFileId
          ? this.signer.sign(student.photoFileId).url
          : null,
        classLabel,
        designation: null,
        admissionNo: student.admissionNo,
        employeeNo: null,
        timestamp: now.toISOString(),
      };
    }

    // Try staff
    const staff = await this.prisma.staff.findFirst({
      where: {
        id: dto.publicId,
        status: 'ACTIVE',
        ...(schoolIds ? { schoolId: { in: schoolIds } } : {}),
      },
    });

    if (staff) {
      // Check if already marked today
      const existingStaffAtt = await this.prisma.staffAttendance.findFirst({
        where: {
          staffId: staff.id,
          date: dateToday,
        },
      });

      let result: QrScanResult;
      if (existingStaffAtt) {
        if (dto.type === 'OUT' && !existingStaffAtt.checkOut) {
          // Mark check-out time
          const checkOutTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          await this.prisma.staffAttendance.update({
            where: { id: existingStaffAtt.id },
            data: { checkOut: checkOutTime },
          });
          result = 'MARKED';
        } else {
          result = 'ALREADY_MARKED';
        }
      } else {
        const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        await this.prisma.staffAttendance.create({
          data: {
            schoolId: staff.schoolId,
            branchId: staff.branchId,
            staffId: staff.id,
            date: dateToday,
            status: 'PRESENT',
            checkIn: checkInTime,
            markedById: user.id,
          },
        });
        result = 'MARKED';
      }

      await this.logScan(
        staff.schoolId,
        user.id,
        dto.publicId,
        'STAFF',
        staff.id,
        result,
      );

      this.audit.stage({
        action: 'attendance.qr_scan',
        entityType: 'QrScanLog',
        entityId: staff.id,
        schoolId: staff.schoolId,
        branchId: staff.branchId,
        after: { resolvedType: 'STAFF', result },
      });

      return {
        result,
        resolvedType: 'STAFF',
        name: staff.name,
        photoUrl: staff.photoFileId
          ? this.signer.sign(staff.photoFileId).url
          : null,
        classLabel: null,
        designation: staff.designation,
        admissionNo: null,
        employeeNo: staff.employeeNo,
        timestamp: now.toISOString(),
      };
    }

    // Not found — log with the first school in scope
    const fallbackSchoolId = schoolIds?.[0] ?? null;
    if (fallbackSchoolId) {
      await this.logScan(
        fallbackSchoolId,
        user.id,
        dto.publicId,
        null,
        null,
        'NOT_FOUND',
      );
    }

    return {
      result: 'NOT_FOUND',
      resolvedType: null,
      name: null,
      photoUrl: null,
      classLabel: null,
      designation: null,
      admissionNo: null,
      employeeNo: null,
      timestamp: now.toISOString(),
    };
  }

  async recentLogs(scope: Scope, limit = 20): Promise<QrScanLogDto[]> {
    const logs = await this.prisma.qrScanLog.findMany({
      where: scope.global ? {} : { schoolId: { in: [...scope.memberSchoolIds] } },
      orderBy: { scannedAt: 'desc' },
      take: limit,
    });

    // Resolve names in bulk
    const studentIds = logs
      .filter((l) => l.resolvedType === 'STUDENT' && l.resolvedId)
      .map((l) => l.resolvedId!);
    const staffIds = logs
      .filter((l) => l.resolvedType === 'STAFF' && l.resolvedId)
      .map((l) => l.resolvedId!);

    const [students, staffList] = await Promise.all([
      studentIds.length
        ? this.prisma.student.findMany({
            where: { id: { in: studentIds } },
            select: { id: true, firstName: true, lastName: true },
          })
        : [],
      staffIds.length
        ? this.prisma.staff.findMany({
            where: { id: { in: staffIds } },
            select: { id: true, name: true },
          })
        : [],
    ]);

    const nameMap = new Map<string, string>();
    for (const s of students) nameMap.set(s.id, fullName(s));
    for (const s of staffList) nameMap.set(s.id, s.name);

    return logs.map((log) => ({
      id: log.id,
      publicId: log.publicId,
      resolvedType: log.resolvedType,
      resolvedName: log.resolvedId ? (nameMap.get(log.resolvedId) ?? null) : null,
      result: log.result,
      scannedAt: log.scannedAt.toISOString(),
    }));
  }

  private async logScan(
    schoolId: string,
    scannedById: string,
    publicId: string,
    resolvedType: QrResolvedType | null,
    resolvedId: string | null,
    result: QrScanResult,
  ) {
    await this.prisma.qrScanLog.create({
      data: {
        schoolId,
        scannedById,
        publicId,
        resolvedType,
        resolvedId,
        result,
      },
    });
  }
}
