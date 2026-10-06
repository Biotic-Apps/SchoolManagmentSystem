import { Injectable } from '@nestjs/common';
import type {
  FilePurpose,
  FileScanStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface NewFile {
  id: string;
  schoolId: string | null;
  purpose: FilePurpose;
  storageKey: string;
  originalName: string;
  mime: string;
  size: number;
  sha256: string;
  uploadedById: string;
  scanStatus?: FileScanStatus;
}

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewFile) {
    return this.prisma.file.create({ data });
  }

  findActive(id: string) {
    return this.prisma.file.findFirst({ where: { id, archivedAt: null } });
  }

  async schoolsOfBranches(branchIds: string[]): Promise<Set<string>> {
    if (branchIds.length === 0) return new Set();
    const rows = await this.prisma.branch.findMany({
      where: { id: { in: branchIds } },
      select: { schoolId: true },
    });
    return new Set(rows.map((row) => row.schoolId));
  }

  importBranchOf(fileId: string) {
    return this.prisma.importBatch.findFirst({
      where: { fileId },
      select: { branchId: true, schoolId: true },
    });
  }
}
