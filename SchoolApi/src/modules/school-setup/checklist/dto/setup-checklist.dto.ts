import { ApiProperty } from '@nestjs/swagger';
import { CHECKLIST_KEYS, type ChecklistKey } from '../checklist-keys';

export class ChecklistItemDto {
  @ApiProperty({ enum: CHECKLIST_KEYS })
  key!: ChecklistKey;
  /** count > 0 */
  done!: boolean;
  count!: number;
}

export class SetupChecklistDto {
  branchId!: string;
  /** Every item done. */
  complete!: boolean;
  /** Always in this order: session, classes, subjects, teachers, students, timetable, feePlan. */
  items!: ChecklistItemDto[];
}
