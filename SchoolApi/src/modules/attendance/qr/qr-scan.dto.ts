import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class QrScanInputDto {
  @IsUUID()
  publicId!: string;

  @ApiProperty({ enum: ['IN', 'OUT'] })
  @IsIn(['IN', 'OUT'])
  type!: 'IN' | 'OUT';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timestamp?: string;
}

export class QrScanResultDto {
  result!: 'MARKED' | 'ALREADY_MARKED' | 'NOT_FOUND' | 'OUTSIDE_HOURS';
  resolvedType?: 'STUDENT' | 'STAFF' | null;
  name?: string | null;
  photoUrl?: string | null;
  classLabel?: string | null;
  designation?: string | null;
  admissionNo?: string | null;
  employeeNo?: string | null;
  timestamp!: string;
}

export class QrScanLogDto {
  id!: string;
  publicId!: string;
  resolvedType?: 'STUDENT' | 'STAFF' | null;
  resolvedName?: string | null;
  result!: string;
  scannedAt!: string;
}
