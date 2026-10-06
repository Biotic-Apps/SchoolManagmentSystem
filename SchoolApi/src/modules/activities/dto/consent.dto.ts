import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import type { ConsentStatus } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class ConsentDecisionDto {
  @IsUUID()
  studentId!: string;

  @IsIn(['GRANTED', 'DECLINED'])
  decision!: 'GRANTED' | 'DECLINED';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class ConsentItemDto {
  student!: IdNameDto;
  guardian!: IdNameDto | null;
  status!: ConsentStatus;
  note!: string | null;
  respondedAt!: string | null;
}

export class ConsentCountsDto {
  pending!: number;
  granted!: number;
  declined!: number;
}

export class ConsentListDto {
  items!: ConsentItemDto[];
  counts!: ConsentCountsDto;
}
