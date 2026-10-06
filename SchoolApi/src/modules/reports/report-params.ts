import { invalid } from '../../core/common/errors/errors';
import type { ParamType, ReportDefinition } from './report-catalog';

export type ReportParams = Record<string, string | number>;

const PATTERNS: Record<Exclude<ParamType, 'int'>, RegExp> = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  month: /^\d{4}-(0[1-9]|1[0-2])$/,
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
};

const MAX_RANGE_DAYS = 366;

/** Keeps only declared params, typed and checked; 400 with `details.param`. */
export function validateParams(
  report: ReportDefinition,
  raw: Record<string, unknown> | undefined,
): ReportParams {
  const input = raw ?? {};
  const out: ReportParams = {};
  for (const param of report.params) {
    const value = input[param.name];
    if (value === undefined || value === null || value === '') {
      if (param.required) {
        throw invalid(`${param.name} is required`, { param: param.name });
      }
      continue;
    }
    if (param.type === 'int') {
      const n = typeof value === 'string' ? Number(value) : value;
      if (typeof n !== 'number' || !Number.isInteger(n) || n < 0 || n > 3650) {
        throw invalid(`${param.name} must be a whole number`, {
          param: param.name,
        });
      }
      out[param.name] = n;
      continue;
    }
    if (typeof value !== 'string' || !PATTERNS[param.type].test(value)) {
      throw invalid(`${param.name} must be a valid ${param.type}`, {
        param: param.name,
      });
    }
    out[param.name] = param.type === 'uuid' ? value.toLowerCase() : value;
  }
  if (typeof out.from === 'string' && typeof out.to === 'string') {
    const days =
      (Date.parse(out.to) - Date.parse(out.from)) / (24 * 60 * 60 * 1000);
    if (days < 0) throw invalid('from must not be after to', { param: 'to' });
    if (days > MAX_RANGE_DAYS) {
      throw invalid(`Date range is limited to ${MAX_RANGE_DAYS} days`, {
        param: 'to',
      });
    }
  }
  return out;
}
