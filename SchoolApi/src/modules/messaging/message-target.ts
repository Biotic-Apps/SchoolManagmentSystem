import { conflict, forbidden } from '../../core/common/errors/errors';

export interface StaffOption {
  userId: string;
  name: string;
  role: 'CLASS_TEACHER' | 'SUBJECT_TEACHER' | 'PRINCIPAL';
  subjectName?: string;
}

export interface RawStaffOption {
  userId: string | null;
  name: string;
  role: StaffOption['role'];
  subjectName?: string;
}

/** Keeps staff with a login, one entry per user (subject names joined). */
export function mergeStaffOptions(raw: RawStaffOption[]): StaffOption[] {
  const byUser = new Map<string, StaffOption>();
  for (const option of raw) {
    if (!option.userId) continue;
    const existing = byUser.get(option.userId);
    if (!existing) {
      byUser.set(option.userId, {
        userId: option.userId,
        name: option.name,
        role: option.role,
        ...(option.subjectName ? { subjectName: option.subjectName } : {}),
      });
    } else if (option.subjectName) {
      const names = existing.subjectName
        ? existing.subjectName.split(', ')
        : [];
      if (!names.includes(option.subjectName)) names.push(option.subjectName);
      existing.subjectName = names.join(', ');
    }
  }
  return [...byUser.values()];
}

/** The staff member a parent writes to: the requested one or the class teacher. */
export function pickStaffTarget(
  options: StaffOption[],
  requestedUserId?: string,
): StaffOption {
  if (requestedUserId) {
    const found = options.find((o) => o.userId === requestedUserId);
    if (!found) throw forbidden('You cannot message this staff member');
    return found;
  }
  const classTeacher = options.find((o) => o.role === 'CLASS_TEACHER');
  if (!classTeacher) throw conflict('The section has no class teacher');
  return classTeacher;
}

/** Thread participant role stored for a staff option. */
export const participantRole = (option: StaffOption): string =>
  option.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'TEACHER';
