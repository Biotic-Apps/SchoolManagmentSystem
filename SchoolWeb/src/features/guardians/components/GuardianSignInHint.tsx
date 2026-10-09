import { loginPageUrl } from "../login-url";
import type { GuardianLogin } from "../types";

interface GuardianSignInHintProps {
  hasAccount: boolean;
  /** Absent while loading or without guardians.view. */
  login: GuardianLogin | null;
  /** A linked child's admission number, which also works as the username. */
  admissionNo?: string | null;
}

const Strong = ({ children }: { children: string }) => <span className="font-medium text-fg">{children}</span>;

/** One plain sentence: whether and how this parent signs in. */
export function GuardianSignInHint({ hasAccount, login, admissionNo }: GuardianSignInHintProps) {
  if (!hasAccount) {
    return (
      <span className="text-fg-muted">
        <span className="font-medium text-warning">No parent sign-in yet.</span> They can’t use the parent app or
        website, and teachers can’t message them.
      </span>
    );
  }
  if (!login) return <span className="text-fg-muted">Has a parent sign-in.</span>;
  if (login.status !== "ACTIVE") return <span className="font-medium text-warning">Parent sign-in is disabled.</span>;
  const ids = [admissionNo, login.email, login.phone].filter((id): id is string => !!id);
  return (
    <span className="min-w-0 break-words text-fg-muted">
      Signs in at <Strong>{loginPageUrl()}</Strong> or in the app with username{" "}
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && " or "}
          <Strong>{id}</Strong>
        </span>
      ))}{" "}
      and their password.{" "}
      {login.mustChangePassword
        ? "Still on the temporary password (not changed yet)."
        : !login.lastLoginAt && "Has not signed in yet."}
    </span>
  );
}
