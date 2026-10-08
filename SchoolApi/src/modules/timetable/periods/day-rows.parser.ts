import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { invalid } from '../../../core/common/errors/errors';
import { PeriodInputDto } from '../dto/timetable-input.dto';
import type { BellRowInput } from './bell-schedule';

const fail = (message: string) => invalid(message, [message]);

/** Validates `days: { "5": PeriodInput[] }` (a map class-validator can't type). */
export function parseDayRows(
  days: Record<string, unknown> | undefined,
): Map<number, BellRowInput[]> {
  const parsed = new Map<number, BellRowInput[]>();
  for (const [key, value] of Object.entries(days ?? {})) {
    const day = Number(key);
    if (!Number.isInteger(day) || day < 1 || day > 7)
      throw fail(`days.${key}: day must be 1 (Monday) to 7 (Sunday)`);
    if (!Array.isArray(value) || value.length > 20)
      throw fail(`days.${key} must be a list of at most 20 periods`);
    const rows = value.map((item, i) => {
      const row = plainToInstance(PeriodInputDto, item);
      const errors = validateSync(row, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      if (errors.length > 0) {
        const constraint = Object.values(errors[0].constraints ?? {})[0];
        throw fail(`days.${key}.${i}.${errors[0].property}: ${constraint}`);
      }
      return row;
    });
    parsed.set(day, rows);
  }
  return parsed;
}
