import type { ApplicationStatus } from '../../../generated/prisma/client';
import { DocumentDto } from '../../documents/dto/document.dto';
import { ChildInputDto } from '../../students/dto/child-input.dto';
import { PrimaryGuardianInputDto } from '../../students/dto/guardian-input.dto';
import { MedicalInputDto } from '../../students/dto/medical-input.dto';

export class EntranceTestDto {
  scheduledAt!: string;
  venue!: string | null;
  score!: number | null;
  maxScore!: number | null;
  remarks!: string | null;
}

export class ApplicationDto {
  id!: string;
  applicationNo!: string;
  branchId!: string;
  sessionId!: string;
  classId!: string;
  className!: string;
  status!: ApplicationStatus;
  child!: ChildInputDto;
  guardians!: PrimaryGuardianInputDto[];
  medical!: MedicalInputDto | null;
  notes!: string | null;
  waitlistPosition!: number | null;
  test!: EntranceTestDto | null;
  documents!: DocumentDto[];
  decisionReason!: string | null;
  studentId!: string | null;
  createdAt!: string;
}

export class ConfirmedApplicationDto {
  application!: ApplicationDto;
  studentId!: string;
}
