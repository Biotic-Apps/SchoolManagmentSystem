import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ScopeType } from '../../../generated/prisma/client';

export class AssignmentInputDto {
  @IsString()
  @MaxLength(60)
  roleKey!: string;

  @IsIn(Object.values(ScopeType))
  scopeType!: ScopeType;

  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  /** ISO timestamp; must be in the future. */
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
