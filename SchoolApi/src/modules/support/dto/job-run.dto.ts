import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';
import { QUEUES } from '../../../core/jobs/queues';

export const SUPPORT_JOB_STATUSES = ['RUNNING', 'DONE', 'FAILED'] as const;
export type SupportJobStatus = (typeof SUPPORT_JOB_STATUSES)[number];

const QUEUE_NAMES = Object.values(QUEUES);

export class JobRunQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: QUEUE_NAMES })
  @IsOptional()
  @IsIn(QUEUE_NAMES)
  queue?: string;

  @ApiPropertyOptional({ enum: SUPPORT_JOB_STATUSES })
  @IsOptional()
  @IsIn(SUPPORT_JOB_STATUSES)
  status?: SupportJobStatus;

  @IsOptionalDateOnly()
  from?: string;
}

/** A job run; the job input (`data`) is never returned. */
export class JobRunDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() queue!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: SUPPORT_JOB_STATUSES }) status!: SupportJobStatus;
  @ApiProperty() attempts!: number;
  @ApiProperty({ nullable: true, type: String }) error!: string | null;
  @ApiProperty({ format: 'date-time' }) startedAt!: string;
  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  finishedAt!: string | null;
  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  retriedAt!: string | null;
  @ApiProperty({ description: 'FAILED, input stored and not retried yet' })
  retryable!: boolean;
}
