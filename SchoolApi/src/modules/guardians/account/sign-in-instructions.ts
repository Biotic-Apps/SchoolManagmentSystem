export interface SignInContact {
  email: string | null;
  phone: string | null;
}

/** Plain sign-in steps for a parent; never contains a password. */
export function signInInstructions(
  name: string,
  login: SignInContact,
): { title: string; body: string } {
  const ids = [login.email, login.phone].filter(Boolean).join(' or ');
  const withCode = login.email
    ? `choose "Sign in with email code", enter ${login.email} and type the code we email you. Or `
    : '';
  return {
    title: 'Your parent account is ready',
    body:
      `Dear ${name}, open the school app or website and ${withCode}` +
      `sign in with ${ids} and the password the school gave you. ` +
      'You will see your children’s attendance, homework, results and fees.',
  };
}
