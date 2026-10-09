import { ValidateBy, type ValidationOptions } from 'class-validator';
import { TIME_24H } from './is-time';

type Compare = (value: string, other: string) => boolean;

/** Compares two `HH:mm` fields; skipped when either is missing or malformed. */
function timeOrder(
  name: string,
  other: string,
  compare: Compare,
  message: string,
  options?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name,
      constraints: [other],
      validator: {
        validate(value: unknown, args): boolean {
          const target = (args?.object as Record<string, unknown>)[other];
          if (typeof value !== 'string' || typeof target !== 'string')
            return true;
          if (!TIME_24H.test(value) || !TIME_24H.test(target)) return true;
          return compare(value, target);
        },
        defaultMessage: () => `$property must be ${message} ${other}`,
      },
    },
    options,
  );
}

/** `HH:mm` at or before another `HH:mm` property of the same object. */
export const IsTimeNotAfter = (other: string, options?: ValidationOptions) =>
  timeOrder('isTimeNotAfter', other, (a, b) => a <= b, 'at or before', options);

/** `HH:mm` at or after another `HH:mm` property of the same object. */
export const IsTimeNotBefore = (other: string, options?: ValidationOptions) =>
  timeOrder('isTimeNotBefore', other, (a, b) => a >= b, 'at or after', options);
