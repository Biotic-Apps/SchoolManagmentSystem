import type { Readable } from 'node:stream';
import { Injectable, Logger } from '@nestjs/common';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BranchSettingsReader } from '../../branches/settings/branch-settings.reader';
import { balanceOf, OPEN_STATUSES } from '../../finance-core/invoice-state';
import { fullName } from '../../students/student.mapper';
import {
  BANK_ACCOUNT_KEY,
  CHALLAN_NOTE_KEY,
  toBankAccount,
} from './bank-account';
import {
  toChallanView,
  type ChallanInvoice,
  type ChallanSchool,
  type ChallanView,
} from './challan-data';

/** Challans rendered before the three-copy layout are rendered again. */
const LAYOUT_SINCE = new Date('2026-10-09T08:00:00Z');

const LOGO_TYPES = new Set(['image/png', 'image/jpeg']);

const INCLUDE = {
  lines: {
    include: { feeHead: { select: { name: true } } },
    orderBy: { id: 'asc' as const },
  },
  student: {
    select: {
      firstName: true,
      lastName: true,
      admissionNo: true,
      guardianLinks: {
        where: { status: { in: ['VERIFIED' as const, 'REQUESTED' as const] } },
        select: {
          relation: true,
          isPrimary: true,
          guardian: { select: { name: true } },
        },
      },
    },
  },
};

async function readAll(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks);
}

type Links = {
  relation: string;
  isPrimary: boolean;
  guardian: { name: string };
}[];

/** Father first, else the primary guardian, else any guardian. */
export function fatherName(links: Links): string | null {
  const pick =
    links.find((l) => l.relation === 'FATHER') ??
    links.find((l) => l.isPrimary) ??
    links[0];
  return pick?.guardian.name ?? null;
}

/** Loads what challans print: branch header, bank account, invoices with arrears. */
@Injectable()
export class ChallanSource {
  private readonly logger = new Logger(ChallanSource.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: BranchSettingsReader,
    private readonly storage: StorageDriver,
  ) {}

  async school(branchId: string): Promise<ChallanSchool> {
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: branchId },
      select: {
        name: true,
        address: true,
        phone: true,
        school: {
          select: {
            name: true,
            logoFile: {
              select: { storageKey: true, mime: true, archivedAt: true },
            },
          },
        },
      },
    });
    const [bank, note] = await Promise.all([
      this.settings.get<unknown>(branchId, BANK_ACCOUNT_KEY),
      this.settings.get<string>(branchId, CHALLAN_NOTE_KEY),
    ]);
    return {
      schoolName: branch.school.name,
      branchName: branch.name,
      branchLine: [branch.name, branch.address, branch.phone]
        .filter(Boolean)
        .join(' · '),
      logo: await this.logo(branch.school.logoFile),
      bank: toBankAccount(bank),
      note: typeof note === 'string' ? note.trim() : '',
    };
  }

  /**
   * Last change to anything a challan prints: the invoice, the student's other
   * open invoices (arrears) and the branch bank account / note.
   */
  async changedAt(invoice: {
    id: string;
    studentId: string;
    branchId: string;
    updatedAt: Date;
  }): Promise<Date> {
    const [others, settings] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { studentId: invoice.studentId, id: { not: invoice.id } },
        _max: { updatedAt: true },
      }),
      this.prisma.branchSetting.aggregate({
        where: {
          branchId: invoice.branchId,
          key: { in: [BANK_ACCOUNT_KEY, CHALLAN_NOTE_KEY] },
        },
        _max: { updatedAt: true },
      }),
    ]);
    const times = [
      LAYOUT_SINCE,
      invoice.updatedAt,
      others._max.updatedAt,
      settings._max.updatedAt,
    ].map((d) => d?.getTime() ?? 0);
    return new Date(Math.max(...times));
  }

  /** Views in the order of `invoiceIds` (unknown ids are skipped). */
  async views(
    invoiceIds: string[],
    school: ChallanSchool,
  ): Promise<ChallanView[]> {
    const rows = await this.prisma.invoice.findMany({
      where: { id: { in: invoiceIds } },
      include: INCLUDE,
    });
    const [sections, open] = await Promise.all([
      this.sectionLabels(rows.map((r) => r.sectionId)),
      this.prisma.invoice.findMany({
        where: {
          studentId: { in: [...new Set(rows.map((r) => r.studentId))] },
          status: { in: OPEN_STATUSES },
        },
        select: {
          id: true,
          studentId: true,
          invoiceNo: true,
          period: true,
          dueDate: true,
          totalMinor: true,
          paidMinor: true,
        },
      }),
    ]);
    const byId = new Map(rows.map((row) => [row.id, row]));
    return invoiceIds.flatMap((id) => {
      const row = byId.get(id);
      if (!row) return [];
      const arrears = open
        .filter(
          (o) =>
            o.studentId === row.studentId &&
            o.id !== row.id &&
            (o.dueDate < row.dueDate ||
              (o.dueDate.getTime() === row.dueDate.getTime() &&
                o.invoiceNo < row.invoiceNo)),
        )
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .map((o) => ({ period: o.period, balanceMinor: balanceOf(o) }));
      const invoice: ChallanInvoice = {
        invoiceNo: row.invoiceNo,
        status: row.status,
        period: row.period,
        issueDate: row.issueDate,
        dueDate: row.dueDate,
        currency: row.currency,
        lines: row.lines.map((l) => ({
          head: l.feeHead.name,
          amountMinor: l.amountMinor,
        })),
        concessionMinor: row.concessionMinor,
        lateFeeMinor: row.lateFeeMinor,
        totalMinor: row.totalMinor,
        paidMinor: row.paidMinor,
        lateFeeRule: row.lateFeeRule,
        student: {
          name: fullName(row.student),
          fatherName: fatherName(row.student.guardianLinks),
          admissionNo: row.student.admissionNo,
          classLabel: (row.sectionId && sections.get(row.sectionId)) || '',
        },
        arrears,
      };
      return [toChallanView(invoice, school)];
    });
  }

  private async sectionLabels(
    ids: (string | null)[],
  ): Promise<Map<string, string>> {
    const sectionIds = [...new Set(ids.filter((id): id is string => !!id))];
    const sections = await this.prisma.section.findMany({
      where: { id: { in: sectionIds } },
      select: { id: true, name: true, schoolClass: { select: { name: true } } },
    });
    return new Map(
      sections.map((s) => [s.id, `${s.schoolClass.name} - ${s.name}`]),
    );
  }

  private async logo(
    file: { storageKey: string; mime: string; archivedAt: Date | null } | null,
  ): Promise<Buffer | null> {
    if (!file || file.archivedAt || !LOGO_TYPES.has(file.mime)) return null;
    try {
      return await readAll(await this.storage.read(file.storageKey));
    } catch (error) {
      this.logger.warn(`School logo unreadable: ${String(error)}`);
      return null;
    }
  }
}
