import type { IdCardStatus } from '../../../generated/prisma/client';

export class IdCardJobDto {
  /** Id of the card version being rendered; poll `GET /students/:id/id-card`. */
  jobId!: string;
}

export class IdCardStatusDto {
  status!: IdCardStatus;
  fileUrl!: string | null;
  version!: number;
  generatedAt!: string | null;
}
