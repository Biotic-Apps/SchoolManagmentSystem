import { Injectable } from '@nestjs/common';
import { FileRefService } from '../../core/files/file-ref.service';
import { UrlSigner } from '../../core/files/url-signer';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { AttachmentDto } from './dto/notice.dto';

/** Validates attachment file ids and turns them into signed links. */
@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly files: FileRefService,
    private readonly signer: UrlSigner,
  ) {}

  async assertUsable(
    fileIds: string[] | undefined,
    owner: { schoolId: string; userId: string },
  ): Promise<string[]> {
    const ids = [...new Set(fileIds ?? [])];
    for (const fileId of ids) {
      await this.files.assertUsable(fileId, {
        ...owner,
        purposes: ['ATTACHMENT', 'DOCUMENT'],
      });
    }
    return ids;
  }

  async describe(fileIds: string[]): Promise<Map<string, AttachmentDto>> {
    const ids = [...new Set(fileIds)];
    if (ids.length === 0) return new Map();
    const rows = await this.prisma.file.findMany({
      where: { id: { in: ids }, archivedAt: null },
      select: { id: true, mime: true, originalName: true },
    });
    return new Map(
      rows.map((f) => [
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

  pick(map: Map<string, AttachmentDto>, fileIds: string[]): AttachmentDto[] {
    return fileIds.flatMap((id) => {
      const found = map.get(id);
      return found ? [found] : [];
    });
  }
}
