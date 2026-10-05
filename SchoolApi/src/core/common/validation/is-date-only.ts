import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

const DATE_ONLY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** `YYYY-MM-DD` request field. */
export const IsDateOnly = () =>
  applyDecorators(
    ApiProperty({ example: '2026-04-01', format: 'date' }),
    Matches(DATE_ONLY, { message: '$property must be YYYY-MM-DD' }),
  );

export const IsOptionalDateOnly = () =>
  applyDecorators(
    ApiPropertyOptional({ example: '2026-04-01', format: 'date' }),
    IsOptional(),
    Matches(DATE_ONLY, { message: '$property must be YYYY-MM-DD' }),
  );
