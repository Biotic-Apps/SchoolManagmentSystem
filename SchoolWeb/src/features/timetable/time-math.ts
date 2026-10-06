/** "HH:mm" → minutes since midnight. */
export function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/** Minutes → "HH:mm", clamped to the same day. */
export function fromMinutes(total: number): string {
  const clamped = Math.min(Math.max(total, 0), 23 * 60 + 55);
  return `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`;
}

export const addMinutes = (value: string, minutes: number) => fromMinutes(toMinutes(value) + minutes);
