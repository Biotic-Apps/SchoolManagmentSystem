import { Injectable } from '@nestjs/common';
import { notFound } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { AckSmsDto, GatewayStatusDto, PendingSmsDto } from './dto/sms-gateway.dto';

const MAX_PENDING = 20;

@Injectable()
export class SmsGatewayService {
  constructor(private readonly prisma: PrismaService) {}

  /** Pending messages for the authenticated user's school(s). */
  async pending(scope: Scope): Promise<PendingSmsDto[]> {
    const rows = await this.prisma.smsOutbox.findMany({
      where: {
        ...scope.schoolFilter(),
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
      take: MAX_PENDING,
      select: {
        id: true,
        to: true,
        message: true,
        senderId: true,
        createdAt: true,
      },
    });
    return rows.map((row) => ({
      id: row.id,
      to: row.to,
      message: row.message,
      senderId: row.senderId,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  /** Phone acknowledges it sent (or failed to send) a message. */
  async acknowledge(
    scope: Scope,
    id: string,
    dto: AckSmsDto,
  ): Promise<void> {
    const row = await this.prisma.smsOutbox.findUnique({
      where: { id },
      select: { id: true, schoolId: true, status: true },
    });
    if (!row) throw notFound('SmsOutbox');

    // Verify the message belongs to the user's school scope.
    const filter = scope.schoolFilter();
    if (filter.schoolId && !filter.schoolId.in.includes(row.schoolId)) {
      throw notFound('SmsOutbox');
    }

    await this.prisma.smsOutbox.update({
      where: { id },
      data: {
        status: dto.status,
        error: dto.status === 'FAILED' ? (dto.error ?? 'Unknown error') : null,
        attempts: { increment: 1 },
        sentAt: dto.status === 'SENT' ? new Date() : undefined,
      },
    });
  }

  /** Gateway status for the settings page. */
  async status(scope: Scope): Promise<GatewayStatusDto> {
    const schoolIds = [...scope.schoolIds];
    const schoolId = schoolIds[0];
    if (!schoolId) {
      return { enabled: false, deviceId: null, pending: 0, lastSentAt: null };
    }

    const settings = await this.prisma.schoolSetting.findUnique({
      where: { schoolId },
      select: { notifications: true },
    });

    const notifications = (settings?.notifications ?? {}) as Record<string, unknown>;
    const smsGateway = (notifications.smsGateway ?? {}) as Record<string, unknown>;
    const enabled = smsGateway.enabled === true;
    const deviceId = (smsGateway.deviceId as string) ?? null;

    const [pendingCount, lastSent] = await Promise.all([
      this.prisma.smsOutbox.count({
        where: { schoolId, status: 'PENDING' },
      }),
      this.prisma.smsOutbox.findFirst({
        where: { schoolId, status: 'SENT' },
        orderBy: { sentAt: 'desc' },
        select: { sentAt: true },
      }),
    ]);

    return {
      enabled,
      deviceId,
      pending: pendingCount,
      lastSentAt: lastSent?.sentAt?.toISOString() ?? null,
    };
  }
}
