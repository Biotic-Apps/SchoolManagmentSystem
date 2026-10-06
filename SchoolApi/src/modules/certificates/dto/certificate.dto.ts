import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CertificateStatus,
  CertificateType,
} from '../../../generated/prisma/client';

export class CertificateStudentDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() admissionNo!: string;
  @ApiProperty({ nullable: true }) className!: string | null;
  @ApiProperty({ nullable: true }) sectionName!: string | null;
}

export class CertificatePersonDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class CertificateDto {
  @ApiProperty() id!: string;
  @ApiProperty() branchId!: string;
  @ApiProperty({ nullable: true }) serialNo!: string | null;
  @ApiProperty({ enum: CertificateType }) type!: CertificateType;
  @ApiProperty({ enum: CertificateStatus }) status!: CertificateStatus;
  @ApiProperty({ type: CertificateStudentDto }) student!: CertificateStudentDto;
  @ApiProperty({ nullable: true }) purpose!: string | null;
  @ApiProperty({ nullable: true, type: Object }) details!: Record<
    string,
    unknown
  > | null;
  @ApiProperty({ type: CertificatePersonDto })
  requestedBy!: CertificatePersonDto;
  @ApiProperty() requestedAt!: string;
  @ApiProperty({ type: CertificatePersonDto, nullable: true })
  approvedBy!: CertificatePersonDto | null;
  @ApiProperty({ nullable: true, description: 'Issue date YYYY-MM-DD' })
  issuedAt!: string | null;
  @ApiProperty({ nullable: true, description: 'School leaving date' })
  effectiveDate!: string | null;
  @ApiProperty() isDuplicate!: boolean;
  @ApiProperty({ nullable: true }) duplicateOfId!: string | null;
  @ApiProperty({ nullable: true }) reissueReason!: string | null;
  @ApiProperty({ nullable: true }) rejectionReason!: string | null;
  @ApiProperty({ nullable: true }) fileUrl!: string | null;
  @ApiPropertyOptional({ description: 'PDF job (issue/reissue)' })
  jobId?: string;
}

export class CertificateVerificationDto {
  @ApiProperty() valid!: boolean;
  @ApiProperty({ enum: CertificateType, nullable: true })
  type!: CertificateType | null;
  @ApiProperty({ nullable: true }) studentName!: string | null;
  @ApiProperty({ nullable: true }) issuedOn!: string | null;
}
