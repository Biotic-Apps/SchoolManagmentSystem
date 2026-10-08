import { ApiProperty } from '@nestjs/swagger';
import type { RecordStatus } from '../../../../generated/prisma/client';
import {
  DELETION_SUMMARY_KEYS,
  type DeletionSummaryKey,
} from '../deletion-summary';

export class DeletionCountDto {
  @ApiProperty({ enum: DELETION_SUMMARY_KEYS }) key!: DeletionSummaryKey;
  count!: number;
}

/** What DELETE /schools/:id would remove. */
export class SchoolDeletionPreviewDto {
  schoolId!: string;
  code!: string;
  name!: string;
  @ApiProperty({ enum: ['ACTIVE', 'ARCHIVED'] }) status!: RecordStatus;
  /** No other ACTIVE school would remain (allowed; the UI warns). */
  lastActiveSchool!: boolean;
  /** Headline counts in display order; zero counts are left out. */
  @ApiProperty({ type: [DeletionCountDto] }) summary!: DeletionCountDto[];
  /** Accounts deleted because they only belong to this school. */
  removedUsers!: number;
  /** Accounts kept (they belong elsewhere too); only lose this school's roles. */
  keptUsers!: number;
  totalRows!: number;
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'integer' },
    description: 'Rows per database table',
  })
  tables!: Record<string, number>;
}

export const SCHOOL_DELETION_STATES = [
  'IDLE',
  'RUNNING',
  'FAILED',
  'DELETED',
] as const;
export type SchoolDeletionState = (typeof SCHOOL_DELETION_STATES)[number];

export class SchoolDeletionStatusDto {
  schoolId!: string;
  @ApiProperty({
    enum: SCHOOL_DELETION_STATES,
    description:
      'IDLE: no run yet (or still queued) · RUNNING · FAILED (school kept) · DELETED',
  })
  state!: SchoolDeletionState;
  @ApiProperty({ nullable: true, type: String }) error!: string | null;
}
