import { Injectable } from '@nestjs/common';
import { FileRefService } from '../../core/files/file-ref.service';
import { UrlSigner } from '../../core/files/url-signer';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { AttachmentDto } from './dto/complaint.dto';

/** Validates attachment ids on write and resolves signed links on read. */
@Injectable()
export class ComplaintAttachments {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileRefs: FileRefService,
    private readonly signer: UrlSigner,
  ) {}

  async assertUsable(
    fileIds: string[] | undefined,
    schoolId: string,
    userId: string,
  ): Promise<string[]> {
    const ids = [...new Set(fileIds ?? [])];
    for (const fileId of ids) {
      await this.fileRefs.assertUsable(fileId, {
        schoolId,
        userId,
        purposes: ['ATTACHMENT', 'DOCUMENT'],
      });
    }
    return ids;
  }

  async resolve(fileIds: string[]): Promise<Map<string, AttachmentDto>> {
    const ids = [...new Set(fileIds)];
    if (ids.length === 0) return new Map();
    const files = await this.prisma.file.findMany({
      where: { id: { in: ids }, archivedAt: null },
      select: { id: true, originalName: true, mime: true },
    });
    return new Map(
      files.map((f) => [
        f.id,
        {
          id: f.id,
          url: this.signer.sign(f.id).url,
          mime: f.mime,
          name: f.originalName,
        },
      ]),
    );
  }
}
