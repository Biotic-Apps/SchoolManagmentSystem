/** `YYYY-MM-DD` strings map to Date at UTC midnight (Postgres `date`). */
export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}
