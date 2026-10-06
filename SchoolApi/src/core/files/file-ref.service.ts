import { Injectable } from '@nestjs/common';
import type { File, FilePurpose } from '../../generated/prisma/client';
import { invalid } from '../common/errors/errors';
import { PrismaService } from '../prisma/prisma.service';
import { RoleKey } from '../rbac/role-key.enum';

export interface FileRefRule {
  schoolId: string;
  userId: string;
  purposes: FilePurpose[];
}

/** Roles whose branch assignments do not grant branch management. */
const SECTION_LIMITED_ROLES = [RoleKey.TEACHER, RoleKey.HELPER];

/**
 * Checks a file id handed in by a client before a record points at it.
 * Allowed: the caller's own upload, or a file of the record's school when
 * the caller manages that school (GLOBAL, SCHOOL or non-teaching BRANCH
 * assignment). Parents and teachers can therefore only attach their own
 * uploads — attaching someone else's file id would otherwise hand them a
 * signed URL for it in the record's response.
 */
@Injectable()
export class FileRefService {
  constructor(private readonly prisma: PrismaService) {}

  async assertUsable(fileId: string, rule: FileRefRule): Promise<File> {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, archivedAt: null },
    });
    const usable =
      file &&
      (file.uploadedById === rule.userId ||
        (file.schoolId === rule.schoolId &&
          (await this.managesSchool(rule.userId, rule.schoolId))));
    if (!usable) throw invalid('File not found or not accessible');
    if (!rule.purposes.includes(file.purpose)) {
      throw invalid(
        `File must be uploaded with purpose ${rule.purposes.join(' or ')}`,
      );
    }
    if (file.scanStatus === 'INFECTED' || file.scanStatus === 'FAILED') {
      throw invalid('File not found or not accessible');
    }
    return file;
  }

  private async managesSchool(
    userId: string,
    schoolId: string,
  ): Promise<boolean> {
    const now = new Date();
    const count = await this.prisma.roleAssignment.count({
      where: {
        userId,
        revokedAt: null,
        validFrom: { lte: now },
        AND: [
          { OR: [{ validUntil: null }, { validUntil: { gt: now } }] },
          {
            OR: [
              { scopeType: 'GLOBAL' },
              { scopeType: 'SCHOOL', schoolId },
              {
                scopeType: 'BRANCH',
                branch: { schoolId },
                role: { key: { notIn: SECTION_LIMITED_ROLES } },
              },
            ],
          },
        ],
      },
    });
    return count > 0;
  }
}
