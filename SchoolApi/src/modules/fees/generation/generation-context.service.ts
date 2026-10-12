import { Injectable } from '@nestjs/common';
import type { Concession } from '../../../generated/prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { periodOf } from '../../finance-core/period';
import { parseSnapshot, type PlanSnapshot } from '../shared/plan-snapshot';
import type { BillingCalendar } from './due-lines';

export interface GenerateInvoicesInput {
  branchId: string;
  sessionId: string;
  period: string;
  classIds?: string[] | null;
  actorId: string | null;
}

export interface BillablePlan {
  id: string;
  snapshot: PlanSnapshot;
}

export interface Billable {
  studentId: string;
  schoolId: string;
  sectionId: string;
  classId: string;
}

/** Reads everything one generation run needs, in bulk. */
@Injectable()
export class GenerationContextService {
  constructor(private readonly prisma: PrismaService) {}

  async calendar(sessionId: string): Promise<BillingCalendar> {
    const session = await this.prisma.academicSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: { terms: { select: { startDate: true } } },
    });
    return {
      sessionStart: periodOf(session.startDate),
      termStarts: session.terms.map((t) => periodOf(t.startDate)),
    };
  }

  /** The most recently approved plan per class (its approved snapshot). */
  async plans(
    input: GenerateInvoicesInput,
  ): Promise<Map<string, BillablePlan>> {
    const rows = await this.prisma.feePlan.findMany({
      where: {
        branchId: input.branchId,
        sessionId: input.sessionId,
        status: { not: 'ARCHIVED' },
        approvedAt: { not: null },
        ...(input.classIds?.length ? { classId: { in: input.classIds } } : {}),
      },
      orderBy: { approvedAt: 'desc' },
    });
    const plans = new Map<string, BillablePlan>();
    for (const row of rows) {
      const snapshot = parseSnapshot(row.approvedSnapshot);
      if (!snapshot || plans.has(row.classId)) continue;
      plans.set(row.classId, { id: row.id, snapshot });
    }
    return plans;
  }

  async enrollments(input: GenerateInvoicesInput): Promise<Billable[]> {
    const rows = await this.prisma.enrollment.findMany({
      where: {
        branchId: input.branchId,
        sessionId: input.sessionId,
        status: 'ACTIVE',
        ...(input.classIds?.length
          ? { section: { classId: { in: input.classIds } } }
          : {}),
      },
      select: {
        studentId: true,
        schoolId: true,
        sectionId: true,
        section: { select: { classId: true } },
      },
    });
    return rows.map((r) => ({
      studentId: r.studentId,
      schoolId: r.schoolId,
      sectionId: r.sectionId,
      classId: r.section.classId,
    }));
  }

  /** Students that already have a live generated invoice for the period. */
  async alreadyInvoiced(
    studentIds: string[],
    period: string,
  ): Promise<Set<string>> {
    const rows = await this.prisma.invoice.findMany({
      where: {
        studentId: { in: studentIds },
        period,
        source: 'GENERATED',
        status: { not: 'CANCELLED' },
      },
      select: { studentId: true },
    });
    return new Set(rows.map((r) => r.studentId));
  }

  async concessions(
    studentIds: string[],
    period: string,
  ): Promise<Map<string, Concession[]>> {
    const rows = await this.prisma.concession.findMany({
      where: {
        studentId: { in: studentIds },
        status: 'APPROVED',
        fromPeriod: { lte: period },
        OR: [{ toPeriod: null }, { toPeriod: { gte: period } }],
      },
      orderBy: { createdAt: 'asc' },
    });
    const map = new Map<string, Concession[]>();
    for (const row of rows) {
      map.set(row.studentId, [...(map.get(row.studentId) ?? []), row]);
    }
    return map;
  }

  /** `studentId:feeHeadId` of ONCE heads already billed in the session. */
  async onceBilled(
    studentIds: string[],
    sessionId: string,
    feeHeadIds: string[],
  ): Promise<Set<string>> {
    if (feeHeadIds.length === 0) return new Set();
    const rows = await this.prisma.invoiceLine.findMany({
      where: {
        feeHeadId: { in: feeHeadIds },
        invoice: {
          studentId: { in: studentIds },
          sessionId,
          status: { not: 'CANCELLED' },
        },
      },
      select: { feeHeadId: true, invoice: { select: { studentId: true } } },
    });
    return new Set(rows.map((r) => `${r.invoice.studentId}:${r.feeHeadId}`));
  }

  /** Active sibling discount rules for a school. */
  async siblingDiscountRules(
    schoolId: string,
  ): Promise<{ childIndex: number; percentOff: number }[]> {
    return this.prisma.siblingDiscount.findMany({
      where: { schoolId, status: 'ACTIVE' },
      select: { childIndex: true, percentOff: true },
      orderBy: { childIndex: 'asc' },
    });
  }

  /** Map each student to their 1-based child index among siblings in the school. */
  async siblingIndices(
    schoolId: string,
    studentIds: string[],
  ): Promise<Map<string, number>> {
    if (studentIds.length === 0) return new Map();
    const links = await this.prisma.studentGuardian.findMany({
      where: {
        studentId: { in: studentIds },
        schoolId,
        status: 'VERIFIED',
      },
      select: { studentId: true, guardianId: true },
    });
    // Group students by guardian
    const guardianStudents = new Map<string, Set<string>>();
    for (const link of links) {
      const set = guardianStudents.get(link.guardianId) ?? new Set();
      set.add(link.studentId);
      guardianStudents.set(link.guardianId, set);
    }
    // For each student, find their largest sibling group
    const studentGroup = new Map<string, Set<string>>();
    for (const [, students] of guardianStudents) {
      if (students.size < 2) continue;
      for (const sid of students) {
        const existing = studentGroup.get(sid);
        if (!existing || students.size > existing.size)
          studentGroup.set(sid, students);
      }
    }
    // Assign indices by admission date order within each group
    const indices = new Map<string, number>();
    const processed = new Set<string>();
    for (const [studentId, group] of studentGroup) {
      if (processed.has(studentId)) continue;
      const groupArr = [...group];
      const students = await this.prisma.student.findMany({
        where: { id: { in: groupArr }, schoolId, status: 'ACTIVE' },
        select: { id: true, admissionDate: true },
        orderBy: { admissionDate: 'asc' },
      });
      students.forEach((s, i) => {
        indices.set(s.id, i + 1);
        processed.add(s.id);
      });
    }
    for (const sid of studentIds) {
      if (!indices.has(sid)) indices.set(sid, 1);
    }
    return indices;
  }

  async headNames(ids: string[]): Promise<Map<string, string>> {
    const rows = await this.prisma.feeHead.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    return new Map(rows.map((r) => [r.id, r.name]));
  }
}
