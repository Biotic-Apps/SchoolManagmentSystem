import type { Prisma } from '../../generated/prisma/client';

export interface ActivityAudience {
  sectionIds: string[];
  classIds: string[];
  wholeBranch: boolean;
}

export interface StudentPlace {
  branchId: string;
  sectionId: string;
  classId: string;
}

export function normalizeAudience(input: {
  sectionIds?: string[];
  classIds?: string[];
  wholeBranch?: boolean;
}): ActivityAudience {
  return {
    sectionIds: [...new Set(input.sectionIds ?? [])],
    classIds: [...new Set(input.classIds ?? [])],
    wholeBranch: input.wholeBranch === true,
  };
}

export function readAudience(value: Prisma.JsonValue): ActivityAudience {
  const raw = (value ?? {}) as Partial<ActivityAudience>;
  return normalizeAudience(raw);
}

export const isEmptyAudience = (a: ActivityAudience): boolean =>
  !a.wholeBranch && a.sectionIds.length === 0 && a.classIds.length === 0;

export function audienceIncludes(
  audience: ActivityAudience,
  activityBranchId: string,
  place: StudentPlace,
): boolean {
  if (place.branchId !== activityBranchId) return false;
  return (
    audience.wholeBranch ||
    audience.sectionIds.includes(place.sectionId) ||
    audience.classIds.includes(place.classId)
  );
}

/** Activities whose stored audience reaches one of the given students. */
export function audienceFilter(
  places: StudentPlace[],
): Prisma.ActivityWhereInput {
  return {
    OR: places.map((p) => ({
      branchId: p.branchId,
      OR: [
        { audience: { path: ['wholeBranch'], equals: true } },
        { audience: { path: ['sectionIds'], array_contains: [p.sectionId] } },
        { audience: { path: ['classIds'], array_contains: [p.classId] } },
      ],
    })),
  };
}
