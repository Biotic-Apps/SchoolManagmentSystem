import { Injectable } from '@nestjs/common';
import type { DocumentOwnerType, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

export const DOCUMENT_INCLUDE = {
  file: { select: { id: true, mime: true, size: true } },
  verifiedBy: { select: { id: true, name: true } },
} satisfies Prisma.DocumentInclude;

export type DocumentRow = Prisma.DocumentGetPayload<{
  include: typeof DOCUMENT_INCLUDE;
}>;

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByOwner(ownerType: DocumentOwnerType, ownerId: string) {
    return this.prisma.document.findMany({
      where: { ownerType, ownerId },
      include: DOCUMENT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: DOCUMENT_INCLUDE,
    });
  }

  create(data: Prisma.DocumentUncheckedCreateInput) {
    return this.prisma.document.create({ data, include: DOCUMENT_INCLUDE });
  }

  update(id: string, data: Prisma.DocumentUncheckedUpdateInput) {
    return this.prisma.document.update({
      where: { id },
      data,
      include: DOCUMENT_INCLUDE,
    });
  }
}
