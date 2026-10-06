import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ComplaintCategory,
  ComplaintStatus,
} from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';

export const COMPLAINT_BOXES = ['mine', 'assigned', 'all'] as const;
export type ComplaintBox = (typeof COMPLAINT_BOXES)[number];

export class CreateComplaintDto {
  @IsIn(Object.values(ComplaintCategory))
  category!: ComplaintCategory;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description!: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  againstUserId?: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  attachmentFileIds?: string[];
}

export class ComplaintQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(COMPLAINT_BOXES)
  box?: ComplaintBox;

  @IsOptional()
  @IsIn(Object.values(ComplaintStatus))
  status?: ComplaintStatus;

  @IsOptional()
  @IsIn(Object.values(ComplaintCategory))
  category?: ComplaintCategory;
}

export class AssignComplaintDto {
  @IsUUID()
  assigneeUserId!: string;
}

export class ComplaintUpdateInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsIn(['IN_PROGRESS', 'RESOLVED'])
  status?: 'IN_PROGRESS' | 'RESOLVED';

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  attachmentFileIds?: string[];
}

export class ComplaintReasonDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
