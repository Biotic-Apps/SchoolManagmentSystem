import { Injectable } from '@nestjs/common';
import type { FilePurpose } from '../../generated/prisma/client';
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
}
