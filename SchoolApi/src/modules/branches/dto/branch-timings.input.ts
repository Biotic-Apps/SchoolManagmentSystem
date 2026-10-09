import { IsOptional, Matches } from 'class-validator';
import { TIME_24H } from '../../../core/common/validation/is-time';
import {
  IsTimeNotAfter,
  IsTimeNotBefore,
} from '../../../core/common/validation/time-order';

export class BranchTimingsInput {
  /** Students' start time. */
  @Matches(TIME_24H, { message: 'opensAt must be HH:mm' })
  opensAt!: string;

  /** Students' finish time. */
  @Matches(TIME_24H, { message: 'closesAt must be HH:mm' })
  closesAt!: string;

  @Matches(TIME_24H, { message: 'attendanceLockAt must be HH:mm' })
  attendanceLockAt!: string;

  /** Teachers' start time; default 30 minutes before opensAt. */
  @IsOptional()
  @Matches(TIME_24H, { message: 'staffArrivesAt must be HH:mm' })
  @IsTimeNotAfter('opensAt')
  staffArrivesAt?: string;

  /** Teachers' finish time; default closesAt. */
  @IsOptional()
  @Matches(TIME_24H, { message: 'staffLeavesAt must be HH:mm' })
  @IsTimeNotBefore('closesAt')
  staffLeavesAt?: string;
}
