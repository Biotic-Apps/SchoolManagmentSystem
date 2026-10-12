import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ReportCardQueryDto {
  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class ReportCardViewDto {
  examId!: string;
  @ApiProperty({ enum: ['PENDING', 'READY', 'FAILED'] })
  status!: 'PENDING' | 'READY' | 'FAILED';
  fileUrl!: string | null;
  generatedAt!: string | null;
  version!: number;
  templateId?: string;
}
