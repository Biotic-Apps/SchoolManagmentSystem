import type { Prisma } from '../../generated/prisma/client';

export interface NoticeAudience {
  schoolWide: boolean;
  branchIds: string[];
  classIds: string[];
  sectionIds: string[];
  staffOnly: boolean;
  guardianIds: string[];
}

const ids = (value?: string[]) => [...new Set(value ?? [])];

export function normalizeNoticeAudience(
  input: Partial<NoticeAudience>,
): NoticeAudience {
  return {
    schoolWide: input.schoolWide === true,
    branchIds: ids(input.branchIds),
    classIds: ids(input.classIds),
    sectionIds: ids(input.sectionIds),
    staffOnly: input.staffOnly === true,
    guardianIds: ids(input.guardianIds),
  };
}

export function readNoticeAudience(value: Prisma.JsonValue): NoticeAudience {
  return normalizeNoticeAudience((value ?? {}) as Partial<NoticeAudience>);
}

export const hasTargets = (a: NoticeAudience): boolean =>
  a.schoolWide ||
  a.branchIds.length > 0 ||
  a.classIds.length > 0 ||
  a.sectionIds.length > 0 ||
  a.guardianIds.length > 0;
