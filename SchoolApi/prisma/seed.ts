import 'dotenv/config';
import { createSeedClient } from './seed/client';
import { runSeed } from './seed/run-seed';

async function main(): Promise<void> {
  const prisma = createSeedClient(process.env.DATABASE_URL ?? '');
  try {
    const production = process.env.NODE_ENV === 'production';
    await runSeed(prisma, {
      demo: !production,
      resetSystemRoles: !production || process.env.SEED_RESET_ROLE_PERMISSIONS === 'true',
      adminEmail: process.env.SEED_ADMIN_EMAIL,
      adminPassword: process.env.SEED_ADMIN_PASSWORD,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
