import { Transform } from 'class-transformer';

/**
 * Trims a string field before validation, so `@MinLength(1)` / `@IsNotEmpty()`
 * reject whitespace-only values ("   " is not a title).
 */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
