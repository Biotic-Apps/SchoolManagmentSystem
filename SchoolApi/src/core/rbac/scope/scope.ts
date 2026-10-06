import { forbiddenScope, notFound } from '../../common/errors/errors';

export interface ScopeIds {
  schoolIds: Iterable<string>;
  branchIds: Iterable<string>;
  sectionIds: Iterable<string>;
  memberSchoolIds: Iterable<string>;
  memberBranchIds: Iterable<string>;
  /** SECTION assignments: the whole section (class teacher, helper, section supervisor). */
  classSectionIds?: Iterable<string>;
  /** SUBJECT_SECTION assignments as `sectionId:subjectId`. */
  subjectSectionKeys?: Iterable<string>;
  /** Students of verified guardian links (GUARDIAN scope). */
  studentIds?: Iterable<string>;
  sectionLimited?: boolean;
  guardian?: boolean;
}

export interface BranchRef {
  id: string;
  schoolId: string;
}

export interface SectionRef {
  id: string;
  branchId: string;
  schoolId: string;
}

/** Where section-level data (students, timetables, syllabus) may be read. */
export interface SectionAccess {
  all: boolean;
  schoolIds: string[];
  branchIds: string[];
  sectionIds: string[];
}

const brand: unique symbol = Symbol('Scope');

export const subjectSectionKey = (sectionId: string, subjectId: string) =>
  `${sectionId}:${subjectId}`;

/**
 * Resolved data scope of the active role. Repositories require one; only
 * ScopeService creates it.
 * - schoolIds/branchIds: full management access.
 * - member*: what the user may read (their own school/branch records).
 * - sectionLimited: teachers/helpers reach section data only through their
 *   SECTION / SUBJECT_SECTION assignments, never through branch membership.
 * - guardian: parents reach only `studentIds` (others look like 404).
 */
export class Scope {
  readonly [brand] = true;
  readonly schoolIds: ReadonlySet<string>;
  readonly branchIds: ReadonlySet<string>;
  readonly sectionIds: ReadonlySet<string>;
  readonly memberSchoolIds: ReadonlySet<string>;
  readonly memberBranchIds: ReadonlySet<string>;
  readonly classSectionIds: ReadonlySet<string>;
  readonly subjectSectionKeys: ReadonlySet<string>;
  readonly studentIds: ReadonlySet<string>;
  readonly sectionLimited: boolean;
  readonly guardian: boolean;

  private constructor(
    readonly global: boolean,
    ids: ScopeIds,
  ) {
    this.schoolIds = new Set(ids.schoolIds);
    this.branchIds = new Set(ids.branchIds);
    this.sectionIds = new Set(ids.sectionIds);
    this.memberSchoolIds = new Set(ids.memberSchoolIds);
    this.memberBranchIds = new Set(ids.memberBranchIds);
    this.classSectionIds = new Set(ids.classSectionIds ?? []);
    this.subjectSectionKeys = new Set(ids.subjectSectionKeys ?? []);
    this.studentIds = new Set(ids.studentIds ?? []);
    this.sectionLimited = ids.sectionLimited ?? false;
    this.guardian = ids.guardian ?? false;
  }

  static createGlobal(): Scope {
    const none: string[] = [];
    return new Scope(true, {
      schoolIds: none,
      branchIds: none,
      sectionIds: none,
      memberSchoolIds: none,
      memberBranchIds: none,
    });
  }

  static createLimited(ids: ScopeIds): Scope {
    return new Scope(false, ids);
  }

  canReadSchool(schoolId: string): boolean {
    return this.global || this.memberSchoolIds.has(schoolId);
  }

  canManageSchool(schoolId: string): boolean {
    return this.global || this.schoolIds.has(schoolId);
  }

  canReadBranch(branch: BranchRef): boolean {
    return (
      this.global ||
      this.schoolIds.has(branch.schoolId) ||
      this.memberBranchIds.has(branch.id)
    );
  }

  canManageBranch(branch: BranchRef): boolean {
    return (
      this.global ||
      this.schoolIds.has(branch.schoolId) ||
      this.branchIds.has(branch.id)
    );
  }

  /** Section data: managed branch/school, or an assigned section. */
  canReadSection(section: SectionRef): boolean {
    return (
      this.canManageBranch({
        id: section.branchId,
        schoolId: section.schoolId,
      }) || this.sectionIds.has(section.id)
    );
  }

  /** Teaching rights: class/section assignment or the subject in that section. */
  canTeach(sectionId: string, subjectId: string): boolean {
    return (
      this.classSectionIds.has(sectionId) ||
      this.subjectSectionKeys.has(subjectSectionKey(sectionId, subjectId))
    );
  }

  canAccessStudent(studentId: string): boolean {
    return this.studentIds.has(studentId);
  }

  /** Guardians filtering by a student who is not theirs get 404 (security.md §2.5). */
  assertGuardianStudent(studentId: string | undefined): void {
    if (this.guardian && studentId && !this.studentIds.has(studentId)) {
      throw notFound('Student');
    }
  }

  sectionAccess(): SectionAccess {
    return {
      all: this.global,
      schoolIds: [...this.schoolIds],
      branchIds: [...this.branchIds],
      sectionIds: [...this.sectionIds],
    };
  }

  assertReadSchool(schoolId: string): void {
    if (!this.canReadSchool(schoolId)) throw forbiddenScope();
  }

  assertManageSchool(schoolId: string): void {
    if (!this.canManageSchool(schoolId)) throw forbiddenScope();
  }

  assertReadBranch(branch: BranchRef): void {
    if (!this.canReadBranch(branch)) throw forbiddenScope();
  }

  assertManageBranch(branch: BranchRef): void {
    if (!this.canManageBranch(branch)) throw forbiddenScope();
  }

  /** Parents get 404 (no existence leak); everyone else 403. */
  assertReadSection(section: SectionRef, entity = 'Record'): void {
    if (this.canReadSection(section)) return;
    throw this.guardian ? notFound(entity) : forbiddenScope();
  }

  /** Filter for tables with `schoolId`. */
  schoolFilter(): { schoolId?: { in: string[] } } {
    return this.global ? {} : { schoolId: { in: [...this.memberSchoolIds] } };
  }

  /** Filter for tables with `schoolId` + `branchId` (readable branches). */
  branchFilter(): {
    OR?: ({ schoolId: { in: string[] } } | { branchId: { in: string[] } })[];
  } {
    if (this.global) return {};
    return {
      OR: [
        { schoolId: { in: [...this.schoolIds] } },
        { branchId: { in: [...this.memberBranchIds] } },
      ],
    };
  }

  /** Filter for tables with `schoolId` + `branchId` (managed branches only). */
  managedBranchFilter(): {
    OR?: ({ schoolId: { in: string[] } } | { branchId: { in: string[] } })[];
  } {
    if (this.global) return {};
    return {
      OR: [
        { schoolId: { in: [...this.schoolIds] } },
        { branchId: { in: [...this.branchIds] } },
      ],
    };
  }

  /** Filter for tables with `schoolId` + `branchId` + `sectionId`. */
  sectionFilter(): {
    OR?: (
      | { schoolId: { in: string[] } }
      | { branchId: { in: string[] } }
      | { sectionId: { in: string[] } }
    )[];
  } {
    if (this.global) return {};
    return {
      OR: [
        { schoolId: { in: [...this.schoolIds] } },
        { branchId: { in: [...this.branchIds] } },
        { sectionId: { in: [...this.sectionIds] } },
      ],
    };
  }

  /** Filter for the `branches` table itself. */
  branchTableFilter(): {
    OR?: ({ schoolId: { in: string[] } } | { id: { in: string[] } })[];
  } {
    if (this.global) return {};
    return {
      OR: [
        { schoolId: { in: [...this.schoolIds] } },
        { id: { in: [...this.memberBranchIds] } },
      ],
    };
  }
}
