import type { Parsed } from '../../validation/fields';
import { splitSectionRef } from '../shared/academic-refs';

export interface AssignmentRef {
  kind: 'CLASS_TEACHER' | 'SUBJECT_TEACHER';
  classRef: string;
  section: string;
  subjectCode: string | null;
  /** Filled by the checks. */
  sectionId?: string;
  subjectId?: string;
}

/**
 * `CLASS_TEACHER:5-A; SUBJECT_TEACHER:5-B:MATH` → assignment refs.
 * Entries are separated by `;`, parts by `:`.
 */
export function parseAssignments(raw: string): Parsed<AssignmentRef[]> {
  const result: AssignmentRef[] = [];
  for (const entry of raw.split(';').map((e) => e.trim())) {
    if (!entry) continue;
    const parts = entry.split(':').map((p) => p.trim());
    const kind = parts[0].toUpperCase().replace(/[\s-]+/g, '_');
    const section = parts[1] ? splitSectionRef(parts[1]) : null;
    if (kind === 'CLASS_TEACHER' && parts.length === 2 && section) {
      result.push({ kind, ...section, subjectCode: null });
    } else if (
      kind === 'SUBJECT_TEACHER' &&
      parts.length === 3 &&
      section &&
      parts[2]
    ) {
      result.push({ kind, ...section, subjectCode: parts[2].toUpperCase() });
    } else {
      return {
        error: `"${entry}" is not valid; use CLASS_TEACHER:5-A or SUBJECT_TEACHER:5-A:MATH`,
      };
    }
  }
  return { value: result };
}
