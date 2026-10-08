import { ApiProperty } from '@nestjs/swagger';
import type { RecordStatus } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';
import { ClassSubjectDto } from './class-subject.dto';

export const SECTION_TIMETABLE_STATES = [
  'EMPTY',
  'DRAFT',
  'PUBLISHED',
  'PUBLISHED_WITH_CHANGES',
] as const;

export const CLASS_ISSUES = [
  'NO_SECTIONS',
  'NO_SUBJECTS',
  'NO_CLASS_TEACHER',
  'SUBJECTS_WITHOUT_TEACHER',
  'NO_TIMETABLE',
] as const;
export type ClassIssue = (typeof CLASS_ISSUES)[number];

export class ClassSectionDto {
  id!: string;
  name!: string;
  group!: string | null;
  studentCount!: number;
  capacity!: number | null;
  room!: IdNameDto | null;
  classTeacher!: IdNameDto | null;
  @ApiProperty({ enum: SECTION_TIMETABLE_STATES })
  timetable!: (typeof SECTION_TIMETABLE_STATES)[number];
}

export class OverviewSubjectDto {
  id!: string;
  name!: string;
  periodsPerWeek!: number | null;
  group!: string | null;
}

export class ClassOverviewDto {
  id!: string;
  name!: string;
  levelOrder!: number;
  status!: RecordStatus;
  studentCount!: number;
  /** Sum of section capacities; null when none is set. */
  capacity!: number | null;
  sections!: ClassSectionDto[];
  subjects!: OverviewSubjectDto[];
  @ApiProperty({ enum: CLASS_ISSUES, isArray: true })
  issues!: ClassIssue[];
  /** Section × subject pairs without a subject teacher. */
  unallocated!: number;
}

export class ClassRefDto {
  id!: string;
  name!: string;
  levelOrder!: number;
  status!: RecordStatus;
}

export class AllocationCellDto {
  sectionId!: string;
  subjectId!: string;
  staff!: IdNameDto | null;
  assignmentId!: string | null;
  placed!: number;
}

export class ClassSetupDto {
  class!: ClassRefDto;
  branchId!: string;
  sessionId!: string | null;
  sections!: ClassSectionDto[];
  subjects!: ClassSubjectDto[];
  allocation!: AllocationCellDto[];
  /** Distinct section groups of the class. */
  groups!: string[];
  /** classes.edit + manages the school or a branch of it. */
  canEditStructure!: boolean;
  /** timetable.edit or staff.edit + manages the branch. */
  canAllocate!: boolean;
}
