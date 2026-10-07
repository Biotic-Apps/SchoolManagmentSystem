import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export const TEST_CHANNELS = ['EMAIL', 'SMS'] as const;
export type TestChannel = (typeof TEST_CHANNELS)[number];

export class TestMessageDto {
  @ApiProperty({ enum: TEST_CHANNELS })
  @IsIn(TEST_CHANNELS)
  channel!: TestChannel;

  /** Email address (EMAIL) or phone number (SMS). */
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  to!: string;
}

export class TestMessageResultDto {
  @ApiProperty() ok!: boolean;
  /** Provider error (sanitised, ≤ 300 characters) when `ok` is false. */
  @ApiPropertyOptional() error?: string;
}
