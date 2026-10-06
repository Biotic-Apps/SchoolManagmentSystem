import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUUID('all', { each: true })
  attachmentFileIds?: string[];
}

export class CreateThreadDto extends SendMessageDto {
  @IsUUID()
  studentId!: string;

  @IsOptional()
  @IsUUID()
  staffUserId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject!: string;
}

export class ThreadQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  unread?: 'true' | 'false';

  @IsOptional()
  @IsIn(['branch'])
  scope?: 'branch';

  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class ThreadMessagesQueryDto {
  @IsOptional()
  @IsISO8601()
  before?: string;
}

export class RecipientsQueryDto {
  @IsUUID()
  studentId!: string;
}
