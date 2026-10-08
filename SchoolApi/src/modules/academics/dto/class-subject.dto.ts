/** One subject of a class curriculum, in `sortOrder`. */
export class ClassSubjectDto {
  /** Same as subjectId (kept for clients that read `id`). */
  id!: string;
  subjectId!: string;
  code!: string;
  name!: string;
  periodsPerWeek!: number | null;
  isOptional!: boolean;
  /** null = every section; else only sections of this group. */
  group!: string | null;
  sortOrder!: number;
}
