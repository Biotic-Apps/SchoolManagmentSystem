import type { FilePurpose } from '../../generated/prisma/client';
import type { Scope } from '../rbac/scope/scope';

export interface FileAccessTarget {
  purpose: FilePurpose;
  schoolId: string | null;
  uploadedById: string;
}

export interface FileAccessContext {
  userId: string;
  permissions: ReadonlySet<string>;
  scope: Scope;
  /** Schools of the branches the active role manages (branch admins). */
  managedBranchSchoolIds: ReadonlySet<string>;
}

/** Full management scope over the file's school (school or one of its branches). */
export function managesFileSchool(
  file: FileAccessTarget,
  ctx: FileAccessContext,
): boolean {
  if (ctx.scope.global) return true;
  if (file.schoolId === null) return false;
  return (
    ctx.scope.canManageSchool(file.schoolId) ||
    ctx.managedBranchSchoolIds.has(file.schoolId)
  );
}

/**
 * Who may get a signed URL through GET /files/:id/url. Record-bound files
 * (report cards, receipts, photos, documents…) reach parents and teachers
 * only through module endpoints that check the record itself; this generic
 * endpoint serves them to their uploader and school management only.
 */
export function canAccessFile(
  file: FileAccessTarget,
  ctx: FileAccessContext,
): boolean {
  if (file.uploadedById === ctx.userId) return true;
  if (file.purpose === 'SCHOOL_LOGO') {
    return (
      ctx.scope.global ||
      (file.schoolId !== null && ctx.scope.canReadSchool(file.schoolId))
    );
  }
  if (ctx.scope.guardian || ctx.scope.sectionLimited) return false;
  const manages = managesFileSchool(file, ctx);
  switch (file.purpose) {
    case 'REPORT':
      return false;
    case 'PAYSLIP':
      return manages && ctx.permissions.has('payroll.view');
    case 'IMPORT':
      return (
        manages &&
        (ctx.permissions.has('settings.edit') ||
          ctx.permissions.has('settings.import'))
      );
    default:
      return manages;
  }
}
