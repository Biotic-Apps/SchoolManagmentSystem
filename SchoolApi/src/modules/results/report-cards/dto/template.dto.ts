import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportCardTemplateDto {
  @ApiProperty() id!: string;
  @ApiProperty() schoolId!: string;
  @ApiProperty({ nullable: true }) branchId!: string | null;
  @ApiProperty() name!: string;
  @ApiProperty() isDefault!: boolean;
  @ApiProperty({ type: Object }) layout!: Record<string, unknown>;
  @ApiProperty({ type: Object }) header!: Record<string, unknown>;
  @ApiProperty() showGradingScale!: boolean;
  @ApiProperty() showSkills!: boolean;
  @ApiProperty() showRemarks!: boolean;
  @ApiProperty() showAttendance!: boolean;
  @ApiProperty() showPosition!: boolean;
  @ApiProperty({ type: [String] }) signatures!: string[];
  @ApiProperty({ type: [String], nullable: true }) remarkLabels!: string[] | null;
  @ApiProperty({ nullable: true }) footerText!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
