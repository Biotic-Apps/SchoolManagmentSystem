import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export const TIME_24H = /^([01]\d|2[0-3]):[0-5]\d$/;

/** `HH:mm` 24-hour request field (clients display 12-hour). */
export const IsTime = () =>
  applyDecorators(
    ApiProperty({ example: '08:00', pattern: TIME_24H.source }),
    Matches(TIME_24H, { message: '$property must be HH:mm (24-hour)' }),
  );
