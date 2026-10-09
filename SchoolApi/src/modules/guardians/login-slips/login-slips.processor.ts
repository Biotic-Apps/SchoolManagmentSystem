import { createHash } from 'node:crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { IdCardContentLoader } from '../../students/id-card/id-card-content.loader';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../../tasks/async-task.service';
import {
  LoginSlipCredentials,
  type SlipCredentials,
} from './login-slip-credentials';
import { LOGIN_SLIPS_JOB, type LoginSlipsInput } from './login-slip-job';
import { renderLoginSlips, type LoginSlipContent } from './login-slip-pdf';
import { LoginSlipPlanReader } from './login-slip-plan.reader';
import { SchoolLogoReader } from './school-logo.reader';

/**
 * Makes the temporary passwords (never in the job data) and renders the
 * slips PDF. The file is a REPORT, so only the requester can open it.
 */
@Injectable()
export class LoginSlipsProcessor
  implements JobProcessor<TaskJobData<LoginSlipsInput>>, OnModuleInit
{
  readonly queue = QUEUES.DOCUMENTS;
  readonly name = LOGIN_SLIPS_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
    private readonly tasks: AsyncTaskService,
    private readonly plans: LoginSlipPlanReader,
    private readonly credentials: LoginSlipCredentials,
    private readonly cards: IdCardContentLoader,
    private readonly logos: SchoolLogoReader,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<LoginSlipsInput>): Promise<void> {
    return this.tasks.track(input.taskId, async (progress) => {
      const rows = await this.plans.read(input.studentIds);
      const [logo, rolls] = await Promise.all([
        this.logos.read(input.schoolId),
        this.rollNumbers(input.studentIds),
      ]);
      const issued = new Map<string, SlipCredentials>();
      const slips: LoginSlipContent[] = [];
      for (const [i, row] of rows.entries()) {
        const g = row.guardian;
        if (g) {
          const creds =
            issued.get(g.guardianId) ??
            (await this.credentials.issue(g, input.requestedById));
          issued.set(g.guardianId, creds);
          if (creds.action !== 'SKIP') {
            const card = await this.cards.load(row.studentId, null);
            slips.push({
              schoolName: card.schoolName,
              logo,
              helpPhone: card.branchContact,
              childName: card.studentName,
              classLabel: card.classLabel,
              rollNo: rolls.get(row.studentId) ?? null,
              admissionNo: card.admissionNo,
              photo: card.photo,
              parentName: g.name,
              email: creds.email,
              phone: creds.phone,
              temporaryPassword: creds.temporaryPassword,
              loginUrl: input.loginUrl,
            });
          }
        }
        if (i % 10 === 9) await progress((70 * (i + 1)) / rows.length);
      }
      const pdf = await renderLoginSlips(slips);
      const fileId = await this.save(input, pdf);
      await this.record(input, issued);
      return { fileId, count: slips.length };
    });
  }

  private async rollNumbers(
    studentIds: string[],
  ): Promise<Map<string, number | null>> {
    const rows = await this.prisma.enrollment.findMany({
      where: { studentId: { in: studentIds }, status: 'ACTIVE' },
      select: { studentId: true, rollNo: true },
    });
    return new Map(rows.map((r) => [r.studentId, r.rollNo]));
  }

  private async record(
    input: TaskJobData<LoginSlipsInput>,
    issued: Map<string, SlipCredentials>,
  ): Promise<void> {
    const by = (action: SlipCredentials['action']) =>
      [...issued.values()]
        .filter((c) => c.action === action)
        .map((c) => c.userId);
    await this.audit.write(
      [
        {
          action: 'guardian.login_slips_issued',
          entityType: 'AsyncTask',
          entityId: input.taskId,
          schoolId: input.schoolId,
          branchId: input.branchId,
          actorId: input.requestedById,
          after: {
            created: by('CREATE'),
            reset: by('RESET'),
            kept: by('KEEP').length,
            skipped: by('SKIP').length,
          },
        },
      ],
      {},
    );
  }

  private async save(
    input: TaskJobData<LoginSlipsInput>,
    pdf: Buffer,
  ): Promise<string> {
    const storageKey = `login-slips/${new Date().getUTCFullYear()}/${input.taskId}.pdf`;
    await this.storage.put(storageKey, pdf, 'application/pdf');
    const file = await this.prisma.file.create({
      data: {
        schoolId: input.schoolId,
        purpose: 'REPORT',
        storageKey,
        originalName: `${input.baseName}.pdf`,
        mime: 'application/pdf',
        size: pdf.length,
        sha256: createHash('sha256').update(pdf).digest('hex'),
        uploadedById: input.requestedById,
        scanStatus: 'CLEAN',
      },
    });
    return file.id;
  }
}
