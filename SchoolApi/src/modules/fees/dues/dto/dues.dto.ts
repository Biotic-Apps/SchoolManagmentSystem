import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ListQueryDto } from '../../../../core/common/pagination/list-query.dto';

export class DuesQueryDto extends ListQueryDto {
  /** Defaults to every readable branch. */
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  /** Only students whose oldest unpaid due date is at least this many days old. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3650)
  minDays?: number;
}

export class DueRemindersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  studentIds!: string[];
}

export class DuesAgingDto {
  d0_30!: number;
  d31_60!: number;
  d61_90!: number;
  d90plus!: number;
}

export class DuesStudentDto {
  id!: string;
  name!: string;
  admissionNo!: string;
  className!: string | null;
  sectionName!: string | null;
}

export class DuesGuardianDto {
  name!: string;
  phone!: string;
  relation!: string;
}

export class DuesRowDto {
  student!: DuesStudentDto;
  branchId!: string;
  /** Sum of open invoice balances. */
  balanceMinor!: number;
  /** Part of the balance past its due date. */
  overdueMinor!: number;
  oldestOverdueDays!: number;
  openInvoices!: number;
  aging!: DuesAgingDto;
  /** Primary (else first) verified guardian. */
  guardian!: DuesGuardianDto | null;
  currency!: string;
}
