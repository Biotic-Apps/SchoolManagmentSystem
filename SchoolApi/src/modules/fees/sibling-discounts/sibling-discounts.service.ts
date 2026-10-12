import { Injectable } from '@nestjs/common';
import { conflict, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type {
  CreateSiblingDiscountDto,
  SiblingDiscountDto,
  UpdateSiblingDiscountDto,
} from './dto/sibling-discount.dto';

@Injectable()
export class SiblingDiscountsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope): Promise<SiblingDiscountDto[]> {
    const schoolId = scope.schoolId;
    const rows = await this.prisma.siblingDiscount.findMany({
      where: { schoolId, status: 'ACTIVE' },
      orderBy: { childIndex: 'asc' },
    });
    return rows.map((r) => this.toDto(r));
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateSiblingDiscountDto,
  ): Promise<SiblingDiscountDto> {
    scope.assertManageSchool(scope.schoolId);
    const existing = await this.prisma.siblingDiscount.findUnique({
      where: {
        schoolId_childIndex: {
          schoolId: scope.schoolId,
          childIndex: dto.childIndex,
        },
      },
    });
    if (existing && existing.status === 'ACTIVE')
      throw conflict(`A discount rule for child #${dto.childIndex} already exists`);
    // If archived, reactivate with the new percent
    if (existing) {
      const updated = await this.prisma.siblingDiscount.update({
        where: { id: existing.id },
        data: {
          percentOff: dto.percentOff,
          status: 'ACTIVE',
          updatedById: user.id,
        },
      });
      return this.toDto(updated);
    }
    const row = await this.prisma.siblingDiscount.create({
      data: {
        schoolId: scope.schoolId,
        childIndex: dto.childIndex,
        percentOff: dto.percentOff,
        createdById: user.id,
      },
    });
    return this.toDto(row);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateSiblingDiscountDto,
  ): Promise<SiblingDiscountDto> {
    scope.assertManageSchool(scope.schoolId);
    const row = await this.prisma.siblingDiscount.findFirst({
      where: { id, schoolId: scope.schoolId, status: 'ACTIVE' },
    });
    if (!row) throw notFound('Sibling discount rule');
    const updated = await this.prisma.siblingDiscount.update({
      where: { id },
      data: { percentOff: dto.percentOff, updatedById: user.id },
    });
    return this.toDto(updated);
  }

  async remove(user: AuthUser, scope: Scope, id: string): Promise<void> {
    scope.assertManageSchool(scope.schoolId);
    const row = await this.prisma.siblingDiscount.findFirst({
      where: { id, schoolId: scope.schoolId, status: 'ACTIVE' },
    });
    if (!row) throw notFound('Sibling discount rule');
    await this.prisma.siblingDiscount.update({
      where: { id },
      data: { status: 'INACTIVE', updatedById: user.id },
    });
  }

  /** Look up how many siblings each student has for a set of students, returns a map of studentId -> childIndex (1-based). */
  async siblingIndices(
    schoolId: string,
    studentIds: string[],
  ): Promise<Map<string, number>> {
    if (studentIds.length === 0) return new Map();
    // Find all verified guardian links for these students
    const links = await this.prisma.studentGuardian.findMany({
      where: {
        studentId: { in: studentIds },
        schoolId,
        status: 'VERIFIED',
      },
      select: { studentId: true, guardianId: true },
    });
    // Group students by guardian (to find siblings)
    const guardianStudents = new Map<string, Set<string>>();
    for (const link of links) {
      const set = guardianStudents.get(link.guardianId) ?? new Set();
      set.add(link.studentId);
      guardianStudents.set(link.guardianId, set);
    }
    // For each student, find the largest sibling group they belong to
    const studentSiblingGroup = new Map<string, Set<string>>();
    for (const [, students] of guardianStudents) {
      if (students.size < 2) continue;
      for (const sid of students) {
        const existing = studentSiblingGroup.get(sid);
        if (!existing || students.size > existing.size)
          studentSiblingGroup.set(sid, students);
      }
    }
    // Assign child indices within each group (by admission date order)
    const indices = new Map<string, number>();
    const processed = new Set<string>();
    for (const [studentId, group] of studentSiblingGroup) {
      if (processed.has(studentId)) continue;
      const groupStudents = [...group];
      // Get admission dates to order siblings
      const students = await this.prisma.student.findMany({
        where: { id: { in: groupStudents }, schoolId, status: 'ACTIVE' },
        select: { id: true, admissionDate: true },
        orderBy: { admissionDate: 'asc' },
      });
      students.forEach((s, i) => {
        indices.set(s.id, i + 1);
        processed.add(s.id);
      });
    }
    // Students not in any sibling group are child index 1
    for (const sid of studentIds) {
      if (!indices.has(sid)) indices.set(sid, 1);
    }
    return indices;
  }

  private toDto(row: {
    id: string;
    schoolId: string;
    childIndex: number;
    percentOff: number;
    createdAt: Date;
  }): SiblingDiscountDto {
    return {
      id: row.id,
      schoolId: row.schoolId,
      childIndex: row.childIndex,
      percentOff: row.percentOff,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
