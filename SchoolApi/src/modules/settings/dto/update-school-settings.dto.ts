import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Every field optional; `null` clears nullable ones. */
export class UpdateSchoolSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  displayName?: string;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID()
  logoFileId?: string | null;

  /** Format and contrast are checked in the service (message has the ratio). */
  @ApiPropertyOptional({ example: '#7A2944' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(16)
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#F6EAF0' })
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'accentSoftColor must be a hex colour like #F6EAF0',
  })
  accentSoftColor?: string;

  @ApiPropertyOptional({ example: 'eSchool' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  appName?: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 300 })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(300)
  receiptFooter?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 300 })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(300)
  reportCardFooter?: string | null;

  /** IANA zone; checked in the service. */
  @ApiPropertyOptional({ example: 'Asia/Karachi' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiPropertyOptional({ example: 'PKR' })
  @IsOptional()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be 3 capital letters' })
  currency?: string;

  @ApiPropertyOptional({ example: 'en-PK' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  locale?: string;
}
