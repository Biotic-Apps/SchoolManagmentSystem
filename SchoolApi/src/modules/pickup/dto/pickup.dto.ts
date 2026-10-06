import { Type } from 'class-transformer';
import {
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  EarlyLeaveStatus,
  type PickupPersonStatus,
} from '../../../generated/prisma/client';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';
import { IsTime } from '../../../core/common/validation/is-time';

export class AddPickupPersonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  relation!: string;

  @IsOptional()
  @Matches(/^\d{5}-?\d{7}-?\d$/, { message: 'cnic must be 13 digits' })
  cnic?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  phone!: string;

  @IsOptional()
  @IsUUID()
  photoFileId?: string;
}

export class CreateEarlyLeaveDto {
  @IsUUID()
  studentId!: string;

  @IsDateOnly()
  date!: string;

  @IsTime()
  time!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason!: string;

  @IsOptional()
  @IsUUID()
  pickupPersonId?: string;
}

export class EarlyLeaveQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptionalDateOnly()
  date?: string;

  @IsOptional()
  @IsIn(Object.values(EarlyLeaveStatus))
  status?: EarlyLeaveStatus;
}

export class DecisionCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class PickedUpByDto {
  @IsOptional()
  @IsUUID()
  pickupPersonId?: string;

  @IsOptional()
  @IsUUID()
  guardianId?: string;
}

export class CreateDepartureDto {
  @IsUUID()
  studentId!: string;

  @IsOptional()
  @IsUUID()
  earlyLeaveId?: string;

  @ValidateNested()
  @Type(() => PickedUpByDto)
  pickedUpBy!: PickedUpByDto;

  @IsOptional()
  @IsISO8601({ strict: true })
  at?: string;
}

export class DepartureQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptionalDateOnly()
  date?: string;
}

export class RefDto {
  id!: string;
  name!: string;
}

export class PickupPersonDto {
  id!: string;
  studentId!: string;
  name!: string;
  relation!: string;
  cnic!: string | null;
  phone!: string;
  photoUrl!: string | null;
  status!: PickupPersonStatus;
  verifiedAt!: string | null;
}

export class EarlyLeaveDto {
  id!: string;
  student!: RefDto;
  sectionId!: string;
  date!: string;
  time!: string;
  reason!: string;
  pickupPerson!: RefDto | null;
  status!: EarlyLeaveStatus;
  requestedBy!: RefDto;
  decidedBy!: RefDto | null;
  comment!: string | null;
  createdAt!: string;
}

export class DeparturePickerDto {
  pickupPersonId!: string | null;
  guardianId!: string | null;
  name!: string;
}

export class DepartureDto {
  id!: string;
  student!: RefDto;
  earlyLeaveId!: string | null;
  pickedUpBy!: DeparturePickerDto;
  at!: string;
  recordedBy!: RefDto;
}
