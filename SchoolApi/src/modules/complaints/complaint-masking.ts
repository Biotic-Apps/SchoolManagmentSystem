import { RoleKey } from '../../core/rbac/role-key.enum';

export interface MaskViewer {
  id: string;
  activeRole: string;
}

export interface MaskSubject {
  anonymous: boolean;
  complainantId: string;
}

const UNMASKED_ROLES: string[] = [RoleKey.PRINCIPAL, RoleKey.SUPER_ADMIN];

/** Anonymous complainants are hidden except from principals, super admins and themselves. */
export function canSeeComplainant(
  viewer: MaskViewer,
  complaint: MaskSubject,
): boolean {
  if (!complaint.anonymous) return true;
  if (viewer.id === complaint.complainantId) return true;
  return UNMASKED_ROLES.includes(viewer.activeRole);
}

/** Masks a person when they are the anonymous complainant the viewer may not see. */
export function maskPerson<T>(
  person: T | null,
  personId: string | null,
  viewer: MaskViewer,
  complaint: MaskSubject,
): T | null {
  if (!person || personId !== complaint.complainantId) return person;
  return canSeeComplainant(viewer, complaint) ? person : null;
}
