import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AsyncTask } from '../../generated/prisma/client';
import type { UrlSigner } from '../../core/files/url-signer';

export class JobResultDto {
  @ApiPropertyOptional({ nullable: true }) fileUrl?: string | null;
  @ApiPropertyOptional() count?: number;
}

export const JOB_STATUSES = ['QUEUED', 'RUNNING', 'DONE', 'FAILED'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export class JobStatusDto {
  @ApiProperty() id!: string;
  @ApiProperty() queue!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: JOB_STATUSES }) status!: JobStatus;
  @ApiPropertyOptional() progress?: number;
  @ApiPropertyOptional({ type: JobResultDto }) result?: JobResultDto &
    Record<string, unknown>;
  @ApiPropertyOptional() error?: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ nullable: true }) finishedAt!: string | null;
}

const STATUS: Record<AsyncTask['status'], JobStatus> = {
  PENDING: 'QUEUED',
  RUNNING: 'RUNNING',
  COMPLETED: 'DONE',
  FAILED: 'FAILED',
};

export function toJobStatus(task: AsyncTask, signer: UrlSigner): JobStatusDto {
  const [queue, ...rest] = task.kind.split('/');
  const stored = (task.result ?? {}) as Record<string, unknown>;
  const { progress, fileId: _fileId, ...summary } = stored;
  void _fileId;
  const fileUrl = task.fileId ? signer.sign(task.fileId).url : null;
  const dto: JobStatusDto = {
    id: task.id,
    queue: rest.length > 0 ? queue : 'tasks',
    name: rest.length > 0 ? rest.join('/') : task.kind,
    status: STATUS[task.status],
    createdAt: task.createdAt.toISOString(),
    finishedAt: task.finishedAt?.toISOString() ?? null,
  };
  if (typeof progress === 'number') dto.progress = progress;
  if (task.status === 'COMPLETED') dto.result = { ...summary, fileUrl };
  if (task.error) dto.error = task.error;
  return dto;
}
