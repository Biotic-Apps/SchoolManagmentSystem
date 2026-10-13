import { toJson } from '../../src/core/common/prisma-json';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../../src/core/school-settings/notification-settings';
import { DEFAULT_SCHOOL_POLICIES } from '../../src/core/school-settings/school-policies';
import type { SeedClient } from './client';

/** Phase 5 §A: settings row for the demo school (optional; missing row = defaults). Idempotent. */
export async function seedSchoolSettings(
  prisma: SeedClient,
  schoolId: string,
): Promise<void> {
  const school = await prisma.school.findUniqueOrThrow({
    where: { id: schoolId },
    select: { name: true },
  });
  await prisma.schoolSetting.upsert({
    where: { schoolId },
    create: {
      schoolId,
      displayName: school.name,
      primaryColor: '#7B68EE',
      policies: toJson(DEFAULT_SCHOOL_POLICIES),
      notifications: toJson(DEFAULT_NOTIFICATION_SETTINGS),
    },
    update: {},
  });
}
