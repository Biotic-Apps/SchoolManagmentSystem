import type { EmailExtras } from '../../../core/notifications/channels/channel-message';

export interface SignInContact {
  email: string | null;
  phone: string | null;
}

/** Plain sign-in steps for a parent; never contains a password. */
export function signInInstructions(
  name: string,
  login: SignInContact,
  loginUrl: string | null,
): { title: string; body: string; extras?: EmailExtras } {
  const ids = [login.email, login.phone].filter(Boolean).join(' or ');
  const where = loginUrl
    ? `open ${loginUrl} (or the eSchool app)`
    : 'open the school app or website';
  const withCode = login.email
    ? `choose "Sign in with email code", enter ${login.email} and type the code we email you. Or `
    : '';
  return {
    title: 'Your parent account is ready',
    body:
      `Dear ${name}, ${where} and ${withCode}` +
      `sign in with ${ids} and the password the school gave you. ` +
      'You will see your children’s attendance, homework, results and fees.',
    extras: loginUrl
      ? { action: { label: 'Open the sign-in page', url: loginUrl } }
      : undefined,
  };
}
