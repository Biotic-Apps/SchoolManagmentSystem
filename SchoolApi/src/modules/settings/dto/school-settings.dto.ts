import { ApiProperty } from '@nestjs/swagger';

export class SchoolSettingsDto {
  @ApiProperty({ format: 'uuid' }) schoolId!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty({ nullable: true, type: String }) logoFileId!: string | null;
  @ApiProperty({ nullable: true, type: String, description: '5-minute link' })
  logoUrl!: string | null;
  @ApiProperty({ example: '#7A2944' }) primaryColor!: string;
  @ApiProperty({ example: '#F6EAF0' }) accentSoftColor!: string;
  @ApiProperty({ example: 'eSchool' }) appName!: string;
  @ApiProperty({ nullable: true, type: String }) receiptFooter!: string | null;
  @ApiProperty({ nullable: true, type: String })
  reportCardFooter!: string | null;
  @ApiProperty({ example: 'Asia/Karachi' }) timezone!: string;
  @ApiProperty({ example: 'PKR' }) currency!: string;
  @ApiProperty({ example: 'en-PK' }) locale!: string;
}
