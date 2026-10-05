export default async function globalTeardown(): Promise<void> {
  const pg = (globalThis as { __E2E_PG__?: { stop(): Promise<void> } })
    .__E2E_PG__;
  if (pg) await pg.stop();
}
