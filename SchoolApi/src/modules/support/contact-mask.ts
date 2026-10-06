import { maskPhone } from '../../core/common/masking';

/** `ayesha@bright.school` → `a*****@bright.school`. */
export function maskEmail(value: string): string {
  const at = value.lastIndexOf('@');
  if (at <= 0) return '*'.repeat(Math.max(value.length, 3));
  return value[0] + '*'.repeat(Math.max(at - 1, 3)) + value.slice(at);
}

/** Masked destination of a delivery for the support list. */
export function maskContact(
  channel: string,
  user: { email: string | null; phone: string | null; devices: number },
): string | null {
  if (channel === 'EMAIL') return user.email ? maskEmail(user.email) : null;
  if (channel === 'SMS') return user.phone ? maskPhone(user.phone) : null;
  if (channel === 'PUSH') return `${user.devices} device(s)`;
  return null;
}
