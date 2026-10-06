/** First days (UTC, YYYY-MM-DD) of `now`'s month and the `ahead` months after it. */
export function partitionMonths(now: Date, ahead = 2): string[] {
  const months: string[] = [];
  for (let i = 0; i <= ahead; i++) {
    const first = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1),
    );
    months.push(first.toISOString().slice(0, 10));
  }
  return months;
}
