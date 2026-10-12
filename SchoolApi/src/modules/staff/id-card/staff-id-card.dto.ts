import type { IdCardStatus } from '../../../generated/prisma/client';

export class StaffIdCardJobDto {
  /** Id of the card version being rendered; poll `GET /staff/:id/id-card`. */
  jobId!: string;
}

export class StaffIdCardStatusDto {
  status!: IdCardStatus;
  fileUrl!: string | null;
  version!: number;
  generatedAt!: string | null;
}
