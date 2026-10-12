import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AttendanceStatus } from '../../../generated/prisma/client';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';
import { TIME_24H } from '../../../core/common/validation/is-time';
import { AttendanceTallyDto } from '../../attendance/dto/register.dto';

export class StaffAttendanceQueryDto {
  @IsUUID()
  branchId!: string;

  @IsOptionalDateOnly()
  date?: string;
}

export class StaffEntryInputDto {
  @IsUUID()
  staffId!: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsIn(Object.values(AttendanceStatus))
  status!: AttendanceStatus;

  @IsOptional()
  @Matches(TIME_24H, { message: 'checkIn must be HH:mm (24-hour)' })
  checkIn?: string;

  @IsOptional()
  @Matches(TIME_24H, { message: 'checkOut must be HH:mm (24-hour)' })
  checkOut?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  remark?: string;
}

export class SaveStaffAttendanceDto {
  @IsUUID()
  branchId!: string;

  @IsDateOnly()
  date!: string;

  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => StaffEntryInputDto)
  entries!: StaffEntryInputDto[];
}

export class MyStaffAttendanceQueryDto {
  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}

export class StaffAttendanceRowDto {
  staffId!: string;
  name!: string;
  designation!: string;
  photoUrl!: string | null;
  @ApiProperty({ enum: AttendanceStatus, nullable: true })
  status!: AttendanceStatus | null;
  checkIn!: string | null;
  checkOut!: string | null;
  remark!: string | null;
}

export class StaffAttendanceDayDto {
  branchId!: string;
  date!: string;
  entries!: StaffAttendanceRowDto[];
}

export class MyAttendanceRecordDto {
  date!: string;
  @ApiProperty({ enum: AttendanceStatus })
  status!: AttendanceStatus;
  checkIn!: string | null;
  checkOut!: string | null;
  remark!: string | null;
}

export class MyStaffAttendanceDto {
  records!: MyAttendanceRecordDto[];
  summary!: AttendanceTallyDto;
}
