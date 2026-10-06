import { Injectable } from '@nestjs/common';
import type { HealthIncident } from '../../../generated/prisma/client';
import { UrlSigner } from '../../../core/files/url-signer';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { AttachmentDto, IncidentDto } from '../dto/health-incident.dto';

export type IncidentRow = HealthIncident & {
  student: { id: string; firstName: string; lastName: string };
  reportedBy: { id: string; name: string };
};

export const INCIDENT_INCLUDE = {
  student: { select: { id: true, firstName: true, lastName: true } },
  reportedBy: { select: { id: true, name: true } },
} as const;

/** Incident rows → DTOs with signed attachment links. */
@Injectable()
export class IncidentMapper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly signer: UrlSigner,
  ) {}

  async toDtos(rows: IncidentRow[]): Promise<IncidentDto[]> {
    const fileIds = [...new Set(rows.flatMap((r) => r.attachmentFileIds))];
    const files =
      fileIds.length > 0
        ? await this.prisma.file.findMany({
            where: { id: { in: fileIds } },
            select: { id: true, originalName: true, mime: true },
          })
        : [];
    const byId = new Map<string, AttachmentDto>(
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
    return rows.map((row) => ({
      id: row.id,
      student: {
        id: row.student.id,
        name: `${row.student.firstName} ${row.student.lastName}`,
      },
      occurredAt: row.occurredAt.toISOString(),
      type: row.type,
      severity: row.severity,
      description: row.description,
      actionTaken: row.actionTaken,
      attachments: row.attachmentFileIds
        .map((id) => byId.get(id))
        .filter((a): a is AttachmentDto => !!a),
      status: row.status,
      reportedBy: { id: row.reportedBy.id, name: row.reportedBy.name },
      closedAt: row.closedAt?.toISOString() ?? null,
      closeNote: row.closeNote,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async toDto(row: IncidentRow): Promise<IncidentDto> {
    const [dto] = await this.toDtos([row]);
    return dto;
  }
}
