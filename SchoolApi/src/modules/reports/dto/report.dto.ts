import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { JOB_STATUSES, type JobStatus } from '../../tasks/job-status.dto';
import {
  REPORT_FORMATS,
  type ParamType,
  type ReportFormatName,
} from '../report-catalog';

export class ReportParamDto {
  @ApiProperty() name!: string;
  @ApiProperty({ enum: ['uuid', 'month', 'date', 'int'] }) type!: ParamType;
  @ApiProperty() required!: boolean;
}

export class ReportCatalogEntryDto {
  @ApiProperty() key!: string;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ enum: REPORT_FORMATS, isArray: true })
  formats!: ReportFormatName[];
  @ApiProperty({ type: ReportParamDto, isArray: true })
  params!: ReportParamDto[];
}

export class CreateReportDto {
  @ApiProperty({ example: 'fees.aging' })
  @IsString()
  @MaxLength(50)
  key!: string;

  @ApiPropertyOptional({
    type: Object,
    example: { branchId: '…', month: '2026-09' },
  })
  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;

  @ApiProperty({ enum: REPORT_FORMATS })
  @IsIn(REPORT_FORMATS)
  format!: ReportFormatName;
}

export class ReportJobDto {
  @ApiProperty() jobId!: string;
}

export class ReportStatusDto {
  @ApiProperty({ enum: JOB_STATUSES }) status!: JobStatus;
  @ApiProperty({ nullable: true }) fileUrl!: string | null;
  @ApiPropertyOptional({ description: 'Rows in the report (when DONE)' })
  count?: number;
  @ApiPropertyOptional() error?: string;
}
