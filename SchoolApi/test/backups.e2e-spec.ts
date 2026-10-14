import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { as, createTestApp, errorCode, login } from './support/test-app';

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

interface Job {
  status: string;
  error?: string | null;
}

interface Check {
  name: string;
  expected: unknown;
  actual: unknown;
  ok: boolean;
}

interface Backup {
  id: string;
  status: string;
  sizeBytes: number | null;
  checksumSha256: string | null;
  encrypted: boolean;
  storageKey: string | null;
  format: string;
  error: string | null;
  verify: { status: string; at: string | null; checks: Check[] };
}

/** Phase 5 §D: backup → restore check into <db>_restore_check → download. */
describe('Backups (e2e)', () => {
  let app: INestApplication<App>;
  let admin: ReturnType<typeof as>;
  let principal: ReturnType<typeof as>;

  beforeAll(async () => {
    app = await createTestApp();
    admin = as(app, (await login(app, 'admin@eschool.local')).accessToken);
    principal = as(
      app,
      (await login(app, 'principal@eschool.local')).accessToken,
    );
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 500));
    await app.close();
  });

  async function waitJob(jobId: string): Promise<Job> {
    for (let i = 0; i < 600; i++) {
      const job = data<Job>(await admin.get(`/jobs/${jobId}`).expect(200));
      if (job.status === 'DONE' || job.status === 'FAILED') return job;
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error('job did not finish');
  }

  const list = async () =>
    data<Backup[]>(await admin.get('/backups').expect(200));

  it('denies everyone but the Super Admin', async () => {
    expect(errorCode(await principal.get('/backups').expect(403))).toBe(
      'FORBIDDEN',
    );
    await principal.post('/backups').expect(403);
  });

  it('backs up, verifies the restore and serves the encrypted file', async () => {
    const { jobId } = data<{ jobId: string }>(
      await admin.post('/backups').expect(201),
    );
    const job = await waitJob(jobId);
    expect(job).toMatchObject({ status: 'DONE' });

    const [backup] = await list();
    expect(backup).toMatchObject({
      status: 'DONE',
      encrypted: true,
      error: null,
    });
    // pg_dump where the client tools are installed (CI), the COPY dump otherwise.
    expect(['pg_dump', 'copy']).toContain(backup.format);
    expect(backup.checksumSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(backup.sizeBytes).toBeGreaterThan(1000);
    expect(backup.storageKey).toMatch(/^backups\/\d{4}\/\d{2}\/.+\.esbk$/);
    expect(backup.verify.status).toBe('NOT_RUN');

    const verify = data<{ jobId: string }>(
      await admin.post(`/backups/${backup.id}/verify`).expect(200),
    );
    expect(await waitJob(verify.jobId)).toMatchObject({ status: 'DONE' });
    const [checked] = await list();
    const failed = checked.verify.checks.filter((c) => !c.ok);
    expect(failed).toEqual([]);
    expect(checked.verify.status).toBe('PASSED');
    expect(checked.verify.at).not.toBeNull();
    const names = checked.verify.checks.map((c) => c.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'file checksum',
        'decrypt',
        'restore',
        // Only the COPY restore checks foreign keys itself; pg_restore enforces them.
        ...(backup.format === 'copy' ? ['foreign keys'] : []),
        'rows: students',
        'rows: audit_logs',
        'ledger total',
        'ledger per student',
        'latest audit id',
        'migrations',
      ]),
    );
    expect(
      checked.verify.checks.find((c) => c.name === 'rows: users')?.expected,
    ).toBeGreaterThan(0);

    const link = data<{ url: string; expiresAt: string }>(
      await admin.get(`/backups/${backup.id}/download`).expect(200),
    );
    const url = new URL(link.url);
    const file = await request(app.getHttpServer())
      .get(url.pathname + url.search)
      .buffer(true)
      .parse((res, done) => {
        const parts: Buffer[] = [];
        res.on('data', (c: Buffer) => parts.push(c));
        res.on('end', () => done(null, Buffer.concat(parts)));
      })
      .expect(200);
    const bytes = file.body as Buffer;
    expect(bytes.subarray(0, 4).toString()).toBe('ESBK');
    expect(bytes.length).toBe(backup.sizeBytes);

    await request(app.getHttpServer())
      .get(url.pathname + url.search.replace(/sig=[^&]+/, 'sig=forged'))
      .expect(404);
    await principal.get(`/backups/${backup.id}/download`).expect(403);
    await principal.post(`/backups/${backup.id}/verify`).expect(403);
  }, 300_000);

  it('rejects verifying an unknown backup', async () => {
    await admin
      .post('/backups/01900000-0000-7000-8000-000000000000/verify')
      .expect(404);
  });
});
