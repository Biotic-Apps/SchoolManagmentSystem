import { formatDate, parseDate } from '../../core/common/dates';
import { conflict, invalid } from '../../core/common/errors/errors';
import { today } from '../../core/common/week';

/** `expiresOn` input: today or later (a notice that already expired reaches nobody). */
export function expiryDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = parseDate(value);
  if (date < today()) throw invalid('expiresOn cannot be in the past');
  return date;
}

/** Publishing a draft whose expiry date has passed would show an expired notice as PUBLISHED. */
export function assertNotExpired(expiresOn: Date | null, now = today()): void {
  if (expiresOn && expiresOn < now)
    throw conflict(
      `The notice expired on ${formatDate(expiresOn)}; change the expiry date first`,
    );
}
