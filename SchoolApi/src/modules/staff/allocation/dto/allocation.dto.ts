import { IdNameDto } from '../../../../core/common/dto/id-name.dto';

/** One section × subject pair of the class allocation grid. */
export class AllocationRowDto {
  sectionId!: string;
  subjectId!: string;
  staff!: IdNameDto | null;
  assignmentId!: string | null;
  /** Lessons of this subject placed in the section's working timetable. */
  placed!: number;
}

export class ClassTeacherRowDto {
  sectionId!: string;
  staff!: IdNameDto | null;
  assignmentId!: string | null;
}

export class TeachingStaffDto {
  id!: string;
  name!: string;
  designation!: string;
  hasLogin!: boolean;
  /** Σ periodsPerWeek of their subject-teacher allocations in the session. */
  allocatedPeriods!: number;
  /** Lessons placed in working timetables of the session (all sections). */
  placedPeriods!: number;
  /** Sections they teach (class or subject teacher). */
  sections!: number;
}
