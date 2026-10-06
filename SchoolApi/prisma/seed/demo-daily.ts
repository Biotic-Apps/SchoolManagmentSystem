import type { SeedClient } from './client';
import { seedActivities } from './demo-activities';
import { seedAttendance } from './demo-attendance';
import { seedComplaints } from './demo-complaints';
import { loadDailyContext } from './demo-daily-context';
import { seedDiary } from './demo-diary';
import { seedMeetings } from './demo-meetings';
import { seedMessages, seedNotices } from './demo-notices-messages';
import type { DemoOrg } from './demo-people';
import { seedSafety } from './demo-safety';

/** Phase 3 §14 demo data; every step is idempotent. */
export async function seedDailyOperations(
  prisma: SeedClient,
  org: DemoOrg,
): Promise<void> {
  const ctx = await loadDailyContext(prisma, org);
  await seedAttendance(prisma, ctx);
  await seedDiary(prisma, ctx);
  await seedActivities(prisma, ctx);
  await seedNotices(prisma, ctx);
  await seedMessages(prisma, ctx);
  await seedComplaints(prisma, ctx);
  await seedMeetings(prisma, ctx);
  await seedSafety(prisma, ctx);
}
