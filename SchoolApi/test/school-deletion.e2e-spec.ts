import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import request from 'supertest';
import { StorageDriver } from '../src/core/files/storage/storage-driver';
import { PrismaService } from '../src/core/prisma/prisma.service';
import {
  API,
  as,
  createTestApp,
  errorCode,
  login,
  unique,
} from './support/test-app';

interface SetupResult {
  school: { id: string; code: string };
  branch: { id: string };
  principal: { id: string; email: string; temporaryPassword?: string };
}

interface Preview {
  code: string;
  lastActiveSchool: boolean;
  summary: { key: string; count: number }[];
  removedUsers: number;
  tables: Record<string, number>;
}

const data = <T>(res: { body: unknown }) => (res.body as { data: T }).data;

describe('School deletion (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let admin: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    admin = (await login(app, 'admin@eschool.local')).accessToken;
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 500));
    await app.close();
  });

  const setupSchool = async (prefix: string): Promise<SetupResult> => {
    const code = unique(prefix);
    const res = await as(app, admin)
      .post('/schools/setup', {
        school: { code, name: `Delete ${code}` },
        principal: {
          name: 'Delete Principal',
          email: `${code.toLowerCase()}@delete.local`,
        },
        academics: { sectionsPerClass: 2 },
      })
      .expect(201);
    return data<SetupResult>(res);
  };

  const waitForState = async (id: string, state: string) => {
    for (let i = 0; i < 100; i++) {
      const res = await as(app, admin)
        .get(`/schools/${id}/deletion-status`)
        .expect(200);
      if (data<{ state: string }>(res).state === state) return;
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`deletion of ${id} never reached ${state}`);
  };

  it('previews, refuses bad confirmations, deletes only that school', async () => {
    const target = await setupSchool('DX');
    const other = await setupSchool('KP');
    const demoCount = await prisma.school.count();

    // The new principal signs in once (refresh sessions, user rows to clean up).
    await login(
      app,
      target.principal.email,
      target.principal.temporaryPassword,
    );
    // A stored file of the school, removed from storage after commit.
    const storage = app.get(StorageDriver);
    const key = `e2e/${target.school.code}/logo.txt`;
    await storage.put(key, Buffer.from('logo'), 'text/plain');
    await prisma.file.create({
      data: {
        schoolId: target.school.id,
        purpose: 'SCHOOL_LOGO',
        storageKey: key,
        originalName: 'logo.txt',
        mime: 'text/plain',
        size: 4,
        sha256: '0'.repeat(64),
        uploadedById: target.principal.id,
      },
    });

    const previewRes = await as(app, admin)
      .get(`/schools/${target.school.id}/deletion-preview`)
      .expect(200);
    const preview = data<Preview>(previewRes);
    expect(preview.code).toBe(target.school.code);
    expect(preview.lastActiveSchool).toBe(false);
    expect(preview.removedUsers).toBe(1);
    expect(
      Object.fromEntries(preview.summary.map((s) => [s.key, s.count])),
    ).toMatchObject({
      branches: 1,
      users: 1,
      sessions: 1,
      classes: 13,
      sections: 26,
      subjects: 8,
      files: 1,
    });

    const principal = (await login(app, 'principal@eschool.local')).accessToken;
    await as(app, principal)
      .get(`/schools/${target.school.id}/deletion-preview`)
      .expect(403);
    await as(app, principal)
      .delete(`/schools/${target.school.id}`)
      .send({ confirmCode: target.school.code })
      .expect(403);

    const mismatch = await as(app, admin)
      .delete(`/schools/${target.school.id}`)
      .send({ confirmCode: other.school.code })
      .expect(400);
    expect(errorCode(mismatch)).toBe('CONFIRM_CODE_MISMATCH');
    await as(app, admin)
      .delete('/schools/00000000-0000-4000-8000-000000000000')
      .send({ confirmCode: 'NOPE' })
      .expect(404);

    const accepted = await as(app, admin)
      .delete(`/schools/${target.school.id}`)
      .send({ confirmCode: target.school.code })
      .expect(202);
    expect(data<{ state: string }>(accepted).state).toBe('RUNNING');
    await waitForState(target.school.id, 'DELETED');

    await as(app, admin).get(`/schools/${target.school.id}`).expect(404);
    await as(app, admin).get(`/branches/${target.branch.id}`).expect(404);
    expect(
      await prisma.user.count({ where: { id: target.principal.id } }),
    ).toBe(0);
    await request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .send({
        identifier: target.principal.email,
        password: target.principal.temporaryPassword,
        platform: 'WEB',
        deviceName: 'e2e',
      })
      .expect(401);
    await expect(storage.read(key).then(streamText)).rejects.toThrow();

    // Everything else is untouched.
    expect(await prisma.school.count()).toBe(demoCount - 1);
    await as(app, admin).get(`/schools/${other.school.id}`).expect(200);
    await as(app, admin).get(`/branches/${other.branch.id}`).expect(200);
    expect(await prisma.user.count({ where: { id: other.principal.id } })).toBe(
      1,
    );
    expect(
      await prisma.section.count({ where: { schoolId: other.school.id } }),
    ).toBe(26);
    await login(app, 'principal@eschool.local');

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'school.delete', entityId: target.school.id },
    });
    expect(audit?.before).toMatchObject({ code: target.school.code });
    expect(audit?.after).toMatchObject({ removedUsers: 1 });
  });

  it('keeps users that also belong to another school', async () => {
    const target = await setupSchool('DY');
    const other = await setupSchool('KQ');
    const role = await prisma.role.findFirstOrThrow({
      where: { key: 'TEACHER', schoolId: null },
    });
    await prisma.roleAssignment.create({
      data: {
        userId: target.principal.id,
        roleId: role.id,
        scopeType: 'SCHOOL',
        schoolId: other.school.id,
      },
    });

    const preview = data<Preview>(
      await as(app, admin)
        .get(`/schools/${target.school.id}/deletion-preview`)
        .expect(200),
    );
    expect(preview.removedUsers).toBe(0);

    await as(app, admin)
      .delete(`/schools/${target.school.id}`)
      .send({ confirmCode: target.school.code })
      .expect(202);
    await waitForState(target.school.id, 'DELETED');

    const assignments = await prisma.roleAssignment.findMany({
      where: { userId: target.principal.id },
    });
    expect(assignments.map((a) => a.schoolId)).toEqual([other.school.id]);
  });
});

async function streamText(stream: NodeJS.ReadableStream): Promise<string> {
  let text = '';
  for await (const chunk of stream) text += String(chunk);
  return text;
}
