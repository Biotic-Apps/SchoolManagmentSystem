import { Matches } from 'class-validator';

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

export class BranchTimingsInput {
  @Matches(HH_MM, { message: 'opensAt must be HH:mm' })
  opensAt!: string;

  @Matches(HH_MM, { message: 'closesAt must be HH:mm' })
  closesAt!: string;

  @Matches(HH_MM, { message: 'attendanceLockAt must be HH:mm' })
  attendanceLockAt!: string;
}
