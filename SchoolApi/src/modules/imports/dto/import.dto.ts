import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsUUID } from 'class-validator';
import { ImportKind, ImportStatus } from '../../../generated/prisma/client';

export const IMPORT_KINDS = Object.values(ImportKind);

export class ImportKindParamDto {
  @IsIn(IMPORT_KINDS)
  kind!: ImportKind;
}

/** Multipart fields next to `file`. */
export class CreateImportDto {
  @ApiProperty({ enum: IMPORT_KINDS })
  @IsIn(IMPORT_KINDS)
  kind!: ImportKind;

  @IsUUID()
  branchId!: string;

  @IsUUID()
  sessionId!: string;
}

export const CREATE_IMPORT_SCHEMA = {
  type: 'object',
  required: ['file', 'kind', 'branchId', 'sessionId'],
  properties: {
    file: { type: 'string', format: 'binary' },
    kind: { type: 'string', enum: IMPORT_KINDS },
    branchId: { type: 'string', format: 'uuid' },
    sessionId: { type: 'string', format: 'uuid' },
  },
};

export class CommitImportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  skipInvalid?: boolean;
}

export class ImportQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class ImportCreatedDto {
  importId!: string;
}

export class ImportTotalsDto {
  rows!: number;
  valid!: number;
  invalid!: number;
}

export class ImportRowErrorDto {
  row!: number;
  column!: string | null;
  message!: string;
}

export class ImportPersonDto {
  id!: string;
  name!: string;
}

export class ImportSummaryDto {
  id!: string;
  @ApiProperty({ enum: IMPORT_KINDS })
  kind!: ImportKind;
  @ApiProperty({ enum: Object.values(ImportStatus) })
  status!: ImportStatus;
  branchId!: string;
  sessionId!: string | null;
  fileName!: string;
  totals!: ImportTotalsDto;
  createdAt!: string;
  /** Same as createdAt (web history column). */
  startedAt!: string;
  startedBy!: ImportPersonDto | null;
  committedAt!: string | null;
  revertedAt!: string | null;
}

export class ImportDetailDto extends ImportSummaryDto {
  @ApiProperty({ type: [ImportRowErrorDto] })
  errors!: ImportRowErrorDto[];
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  preview!: Record<string, unknown>[];
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  reconciliation!: Record<string, unknown> | null;
  error!: string | null;
}
