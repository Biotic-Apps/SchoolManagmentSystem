import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class BrandingQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Default school if omitted',
  })
  @IsOptional()
  @IsUUID()
  schoolId?: string;
}

export class BrandingDto {
  @ApiProperty() schoolName!: string;
  @ApiProperty({ nullable: true, type: String, description: '5-minute link' })
  logoUrl!: string | null;
  @ApiProperty({ example: '#0B7F74' }) primaryColor!: string;
  @ApiProperty({ example: '#E6F5F2' }) accentSoftColor!: string;
  @ApiProperty({ example: 'eSchool' }) appName!: string;
}
