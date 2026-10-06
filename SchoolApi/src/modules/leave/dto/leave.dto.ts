import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LeaveStatus, LeaveType } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';

export class CreateLeaveDto {
  @ApiPropertyOptional({ description: 'Parent: the child the leave is for' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsDateOnly()
  from!: string;

  @IsDateOnly()
  to!: string;

  @ApiPropertyOptional({ enum: LeaveType })
  @IsOptional()
  @IsIn(Object.values(LeaveType))
  type?: LeaveType;

  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;

  @IsOptional()
  @IsUUID()
  attachmentFileId?: string;
}

export class LeaveQueryDto {
  @ApiPropertyOptional({ enum: ['mine', 'review'], default: 'mine' })
  @IsOptional()
  @IsIn(['mine', 'review'])
  scope?: 'mine' | 'review';

  @ApiPropertyOptional({ enum: LeaveStatus })
  @IsOptional()
  @IsIn(Object.values(LeaveStatus))
  status?: LeaveStatus;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class LeaveDecisionDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class LeaveDto {
  id!: string;
  @ApiProperty({ enum: ['STUDENT', 'STAFF'] })
  kind!: string;
  subject!: IdNameDto;
  from!: string;
  to!: string;
  days!: number;
  @ApiProperty({ enum: LeaveType })
  type!: LeaveType;
  reason!: string;
  @ApiProperty({ enum: LeaveStatus })
  status!: LeaveStatus;
  requestedBy!: IdNameDto;
  decidedBy!: IdNameDto | null;
  comment!: string | null;
  approvalId!: string | null;
  createdAt!: string;
}
