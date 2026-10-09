import { Injectable } from '@nestjs/common';
import { today } from '../../core/common/week';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  StudentPlacementService,
  type StudentPlacement,
} from '../school-day/student-placement.service';
import type { MeetingTeacherDto } from './dto/meeting-request.dto';

const CLASS_TEACHER = 'Class teacher';
const PRINCIPAL = 'Principal';

interface Person {
  userId: string | null;
  name: string;
}

/**
 * Who a parent can meet about a child: the section's class teacher and
 * subject teachers (assignments and the published timetable) and the branch
 * principal, with how many open slots each has. Teachers without a login are
 * left out because they can't receive or answer a request.
 */
@Injectable()
export class MeetingTeachersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
  ) {}

  async forStudent(
    scope: Scope,
    studentId: string,
  ): Promise<MeetingTeacherDto[]> {
    return this.forPlacement(await this.placements.read(scope, studentId));
  }

  async forPlacement(p: StudentPlacement): Promise<MeetingTeacherDto[]> {
    const people = new Map<string, { name: string; roles: string[] }>();
    const add = (person: Person | null | undefined, role: string) => {
      if (!person?.userId) return;
      const entry = people.get(person.userId) ?? {
        name: person.name,
        roles: [],
      };
      if (!entry.roles.includes(role)) entry.roles.push(role);
      people.set(person.userId, entry);
    };
    const [section, assignments, periods, principal] = await Promise.all([
      this.prisma.section.findUnique({
        where: { id: p.sectionId },
        select: { classTeacher: { select: { userId: true, name: true } } },
      }),
      this.prisma.staffAssignment.findMany({
        where: {
          sectionId: p.sectionId,
          endedAt: null,
          kind: { in: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
        },
        select: {
          kind: true,
          staff: { select: { userId: true, name: true } },
          subject: { select: { name: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.timetableSlot.findMany({
        where: {
          published: true,
          timetable: { sectionId: p.sectionId, sessionId: p.sessionId },
        },
        select: {
          staff: { select: { userId: true, name: true } },
          subject: { select: { name: true } },
        },
      }),
      this.principal(p.branchId),
    ]);
    add(section?.classTeacher, CLASS_TEACHER);
    for (const a of assignments) {
      add(
        a.staff,
        a.kind === 'CLASS_TEACHER'
          ? CLASS_TEACHER
          : (a.subject?.name ?? 'Teacher'),
      );
    }
    for (const period of periods) add(period.staff, period.subject.name);
    add(principal, PRINCIPAL);

    const open = await this.openSlots(p.branchId, [...people.keys()]);
    return [...people]
      .map(([userId, e]) => ({
        userId,
        name: e.name,
        roles: e.roles,
        openSlots: open.get(userId) ?? 0,
      }))
      .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  }

  private async principal(branchId: string): Promise<Person | null> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { principal: { select: { id: true, name: true } } },
    });
    const user = branch?.principal;
    return user ? { userId: user.id, name: user.name } : null;
  }

  private async openSlots(
    branchId: string,
    userIds: string[],
  ): Promise<Map<string, number>> {
    if (userIds.length === 0) return new Map();
    const rows = await this.prisma.meetingSlot.groupBy({
      by: ['staffUserId'],
      where: {
        branchId,
        staffUserId: { in: userIds },
        status: 'OPEN',
        date: { gte: today() },
      },
      _count: { _all: true },
    });
    return new Map(rows.map((r) => [r.staffUserId, r._count._all]));
  }
}

/** Class teacher first, principal last, subject teachers in between. */
function rank(t: MeetingTeacherDto): number {
  if (t.roles.includes(CLASS_TEACHER)) return 0;
  return t.roles.length === 1 && t.roles[0] === PRINCIPAL ? 2 : 1;
}
