export const TEST_DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  'postgresql://eschool:eschool@localhost:5433/eschool_test?schema=public';
