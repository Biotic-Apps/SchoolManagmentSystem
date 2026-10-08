import { appliesTo } from '../curriculum/curriculum';
import type {
  AllocationCellDto,
  ClassIssue,
  ClassOverviewDto,
  ClassSectionDto,
} from '../dto/class-overview.dto';
import type { ClassSubjectDto } from '../dto/class-subject.dto';
import type { SetupData } from './class-setup.repository';

type ClassRow = SetupData['classes'][number];
type SectionRow = SetupData['sections'][number];

const TIMETABLE_STATE = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  DRAFT_REVISION: 'PUBLISHED_WITH_CHANGES',
} as const;

export function toSectionDto(s: SectionRow): ClassSectionDto {
  const status = s.timetables[0]?.status;
  return {
    id: s.id,
    name: s.name,
    group: s.group,
    studentCount: s._count.enrollments,
    capacity: s.capacity,
    room: s.room,
    classTeacher: s.classTeacher,
    timetable: status ? TIMETABLE_STATE[status] : 'EMPTY',
  };
}

export function toClassSubjects(c: ClassRow): ClassSubjectDto[] {
  return c.subjects.map((cs) => ({
    id: cs.subjectId,
    subjectId: cs.subjectId,
    code: cs.subject.code,
    name: cs.subject.name,
    periodsPerWeek: cs.periodsPerWeek,
    isOptional: cs.isOptional,
    group: cs.group,
    sortOrder: cs.sortOrder,
  }));
}

/** Every section × applicable subject pair with its teacher (group-filtered). */
export function allocationOf(
  c: ClassRow,
  sections: SectionRow[],
  data: SetupData,
): AllocationCellDto[] {
  return sections.flatMap((section) =>
    c.subjects
      .filter((cs) => appliesTo(cs.group, section.group))
      .map((cs) => {
        const teacher = data.teachers.find(
          (t) => t.sectionId === section.id && t.subjectId === cs.subjectId,
        );
        return {
          sectionId: section.id,
          subjectId: cs.subjectId,
          staff: teacher?.staff ?? null,
          assignmentId: teacher?.id ?? null,
          placed: data.placed.get(`${section.id}:${cs.subjectId}`) ?? 0,
        };
      }),
  );
}

export function toOverview(c: ClassRow, data: SetupData): ClassOverviewDto {
  const sections = data.sections.filter((s) => s.classId === c.id);
  const dtos = sections.map(toSectionDto);
  const unallocated = allocationOf(c, sections, data).filter(
    (a) => !a.staff,
  ).length;
  const capacities = sections
    .map((s) => s.capacity)
    .filter((v): v is number => v !== null);
  const issues: ClassIssue[] = [];
  if (sections.length === 0) issues.push('NO_SECTIONS');
  if (c.subjects.length === 0) issues.push('NO_SUBJECTS');
  if (dtos.some((s) => !s.classTeacher)) issues.push('NO_CLASS_TEACHER');
  if (unallocated > 0) issues.push('SUBJECTS_WITHOUT_TEACHER');
  if (dtos.some((s) => s.timetable === 'EMPTY' || s.timetable === 'DRAFT'))
    issues.push('NO_TIMETABLE');
  return {
    id: c.id,
    name: c.name,
    levelOrder: c.levelOrder,
    status: c.status,
    studentCount: dtos.reduce((n, s) => n + s.studentCount, 0),
    capacity:
      capacities.length > 0 ? capacities.reduce((a, b) => a + b, 0) : null,
    sections: dtos,
    subjects: c.subjects.map((cs) => ({
      id: cs.subjectId,
      name: cs.subject.name,
      periodsPerWeek: cs.periodsPerWeek,
      group: cs.group,
    })),
    issues,
    unallocated,
  };
}
