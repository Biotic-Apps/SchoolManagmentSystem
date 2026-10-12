import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccessCache } from '../../rbac/access/access-cache';
import { SchoolSettingsReader } from '../../school-settings/school-settings.reader';

export interface SenderIdentity {
  /** Email display name (`notifications.email.fromName`). */
  fromName: string | null;
  /** SMS sender id (`notifications.sms.senderId`). */
  senderId: string | null;
  /** Resolved school id (used by android-relay driver). */
  schoolId: string | null;
}

/**
 * School branding of outgoing email/SMS: the first school of the
 * recipient's assignments, else (no recipient, GLOBAL users) the oldest
 * active school. Settings come from the cached reader.
 */
@Injectable()
export class SenderIdentityResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessCache,
    private readonly settings: SchoolSettingsReader,
  ) {}

  async forUser(userId?: string): Promise<SenderIdentity> {
    const schoolId = await this.schoolOf(userId);
    if (!schoolId) return { fromName: null, senderId: null, schoolId: null };
    const { email, sms } = await this.settings.notifications(schoolId);
    return { fromName: email.fromName, senderId: sms.senderId, schoolId };
  }

  private async schoolOf(userId?: string): Promise<string | null> {
    if (userId) {
      const assignments = await this.access.assignments(userId);
      const placed = assignments.find((a) => a.schoolId);
      if (placed?.schoolId) return placed.schoolId;
    }
    const school = await this.prisma.school.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    return school?.id ?? null;
  }
}
