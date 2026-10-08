import { InlineNotice } from "./InlineNotice";
import { SignInDetail } from "./SignInDetail";

interface SignInCredentialsProps {
  /** Who receives the details, e.g. "the principal" or a staff member's name. */
  name: string;
  email?: string | null;
  phone?: string | null;
  temporaryPassword?: string | null;
  /** One column, for narrow containers such as dialogs. */
  stacked?: boolean;
}

/** Sign-in id(s) and a one-time temporary password, each with a Copy button. */
export function SignInCredentials({ name, email, phone, temporaryPassword, stacked }: SignInCredentialsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className={stacked ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        {email && <SignInDetail label="Email" value={email} />}
        {phone && <SignInDetail label="Phone" value={phone} />}
        {temporaryPassword && <SignInDetail label="Temporary password" value={temporaryPassword} secret />}
      </div>
      {temporaryPassword ? (
        <InlineNotice tone="warning">
          <strong>Shown only once.</strong> Copy it now and share it with {name} privately. They choose a new password
          the first time they sign in.
        </InlineNotice>
      ) : (
        <p className="text-label text-fg-muted">They sign in with the password you set; no change is needed.</p>
      )}
    </div>
  );
}
