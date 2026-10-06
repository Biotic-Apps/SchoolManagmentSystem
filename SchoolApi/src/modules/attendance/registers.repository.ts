import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import { PrismaService } from '../../core/prisma/prisma.service';

export const REGISTER_INCLUDE = {
  entries: true,
  submittedBy: { select: { id: true, name: true } },
  onBehalfOf: { select: { id: true, name: true } },
} satisfies Prisma.AttendanceRegisterInclude;

export type RegisterRow = Prisma.AttendanceRegisterGetPayload<{
  include: typeof REGISTER_INCLUDE;
}>;

export interface RosterStudent {
  studentId: string;
  name: string;
  rollNo: number | null;
  photoFileId: string | null;
}

@Injectable()
export class RegistersRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(
    sectionId: string,
    date: Date,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<RegisterRow | null> {
    return db.attendanceRegister.findUnique({
      where: { sectionId_date: { sectionId, date } },
      include: REGISTER_INCLUDE,
    });
  }

  async roster(
    sectionId: string,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<RosterStudent[]> {
    const rows = await db.enrollment.findMany({
      where: { sectionId, status: 'ACTIVE' },
      orderBy: [{ rollNo: 'asc' }, { createdAt: 'asc' }],
      select: {
        rollNo: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoFileId: true,
          },
        },
      },
    });
    return rows.map((r) => ({
      studentId: r.student.id,
      name: `${r.student.firstName} ${r.student.lastName}`,
      rollNo: r.rollNo,
      photoFileId: r.student.photoFileId,
    }));
  }

  /** Students with an APPROVED leave covering the date. */
  async onLeave(
    studentIds: string[],
    date: Date,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<Set<string>> {
    const rows = await db.leaveRequest.findMany({
      where: {
        kind: 'STUDENT',
        status: 'APPROVED',
        studentId: { in: studentIds },
        fromDate: { lte: date },
        toDate: { gte: date },
      },
      select: { studentId: true },
    });
    return new Set(rows.map((r) => r.studentId!));
  }

  /** Row lock on the register so concurrent submits serialise. */
  async lock(
    tx: Prisma.TransactionClient,
    sectionId: string,
    date: Date,
  ): Promise<RegisterRow | null> {
    await tx.$queryRaw`SELECT id FROM attendance_registers
      WHERE section_id = ${sectionId}::uuid AND date = ${formatDate(date)}::date FOR UPDATE`;
    return this.find(sectionId, date, tx);
  }
}
