import { ApiProperty } from '@nestjs/swagger';
import { CHECKLIST_KEYS, type ChecklistKey } from '../checklist-keys';

export class ChecklistItemDto {
  @ApiProperty({ enum: CHECKLIST_KEYS })
  key!: ChecklistKey;
  /** count > 0 (allocation: count === 0 and the session has sections). */
  done!: boolean;
  /** allocation: section × subject pairs still without a subject teacher. */
  count!: number;
}

export class SetupChecklistDto {
  branchId!: string;
  /** Every item done. */
  complete!: boolean;
  /** Always in this order: session, classes, subjects, bellSchedule, teachers, allocation, students, timetable, feePlan. */
  items!: ChecklistItemDto[];
}
