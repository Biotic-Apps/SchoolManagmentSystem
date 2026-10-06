import type { Prisma } from '../../generated/prisma/client';

/** BigInt money (minor units) becomes a JSON number (string if beyond 2^53). */
function replacer(_key: string, value: unknown): unknown {
  if (typeof value !== 'bigint') return value;
  return value <= BigInt(Number.MAX_SAFE_INTEGER) &&
    value >= BigInt(Number.MIN_SAFE_INTEGER)
    ? Number(value)
    : value.toString();
}

/** Converts plain values (dates, BigInts, nested objects) into a JSON column value. */
export function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(value ?? null, replacer),
  ) as Prisma.InputJsonValue;
}
