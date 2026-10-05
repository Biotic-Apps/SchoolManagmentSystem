import type { Prisma } from '../../generated/prisma/client';

/** Converts plain values (dates, nested objects) into a JSON column value. */
export function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}
