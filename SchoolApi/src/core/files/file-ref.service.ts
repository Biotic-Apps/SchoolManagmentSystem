import { Injectable } from '@nestjs/common';
import type { File, FilePurpose } from '../../generated/prisma/client';
import { invalid } from '../common/errors/errors';
import { PrismaService } from '../prisma/prisma.service';

export interface FileRefRule {
  schoolId: string;
  userId: string;
  purposes: FilePurpose[];
}

/** Checks a file id handed in by a client before a record points at it. */
@Injectable()
export class FileRefService {
  constructor(private readonly prisma: PrismaService) {}

  async assertUsable(fileId: string, rule: FileRefRule): Promise<File> {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, archivedAt: null },
    });
    const owned =
      file &&
      (file.uploadedById === rule.userId || file.schoolId === rule.schoolId);
    if (!owned) throw invalid('File not found or not accessible');
    if (!rule.purposes.includes(file.purpose)) {
      throw invalid(
        `File must be uploaded with purpose ${rule.purposes.join(' or ')}`,
      );
    }
    return file;
  }
}
