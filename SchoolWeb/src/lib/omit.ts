/** A shallow copy of `value` without `keys`, e.g. scope fields an update endpoint does not accept. */
export function omit<T extends object, K extends keyof T>(value: T, keys: readonly K[]): Omit<T, K> {
  const copy = { ...value };
  for (const key of keys) delete copy[key];
  return copy;
}
