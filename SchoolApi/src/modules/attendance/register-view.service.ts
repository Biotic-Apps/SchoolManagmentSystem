import { Injectable } from '@nestjs/common';
import type { Section } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import { UrlSigner } from '../../core/files/url-signer';
import type { RegisterDto, RegisterEntryDto } from './dto/register.dto';
import { RegistersRepository } from './registers.repository';

/** Register with the full roster; UNMARKED when none exists (contract §1). */
@Injectable()
export class RegisterViewService {
  constructor(
    private readonly repository: RegistersRepository,
    private readonly signer: UrlSigner,
  ) {}

  async build(section: Section, date: Date): Promise<RegisterDto> {
    const [register, roster] = await Promise.all([
      this.repository.find(section.id, date),
      this.repository.roster(section.id),
    ]);
    const leave = await this.repository.onLeave(
      roster.map((s) => s.studentId),
      date,
    );
    const byStudent = new Map(
      (register?.entries ?? []).map((e) => [e.studentId, e]),
    );
    const entries: RegisterEntryDto[] = roster.map((student) => {
      const entry = byStudent.get(student.studentId);
      const onLeave = leave.has(student.studentId);
      return {
        entryId: entry?.id ?? null,
        studentId: student.studentId,
        name: student.name,
        rollNo: student.rollNo,
        photoUrl: student.photoFileId
          ? this.signer.sign(student.photoFileId).url
          : null,
        status: entry?.status ?? (onLeave ? 'LEAVE' : null),
        remark: entry?.remark ?? null,
        onLeave,
      };
    });
    return {
      id: register?.id ?? null,
      sectionId: section.id,
      date: formatDate(date),
      status: register?.status ?? 'UNMARKED',
      version: register?.version ?? 0,
      submittedBy: register?.submittedBy ?? null,
      onBehalfOf: register?.onBehalfOf ?? null,
      lockedAt: register?.lockedAt?.toISOString() ?? null,
      approvalId: register?.pendingApprovalId ?? null,
      entries,
    };
  }
}
