import { InlineNotice } from "@/components/shared/InlineNotice";
import { SignInDetail } from "@/components/shared/SignInDetail";
import type { ParentLogin, SlipChild } from "../types";

/** One guardian's sign-in: usernames, and the temporary password when just made. */
export function ParentLoginCard({ login, child }: { login: ParentLogin; child: SlipChild | null }) {
  if (login.status === "SKIPPED") {
    return (
      <InlineNotice tone="warning">
        <strong>{login.guardianName}: no sign-in made.</strong> {login.reason}. Correct their email or phone, then use
        “Give sign-in access” on the Guardians tab.
      </InlineNotice>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-input border border-border p-3">
      <span className="font-medium text-fg">{login.guardianName}</span>
      <div className="grid gap-3 sm:grid-cols-2">
        {child && <SignInDetail label="Username (admission no.)" value={child.admissionNo} />}
        {login.email && <SignInDetail label="Or email" value={login.email} />}
        {login.phone && <SignInDetail label="Or phone" value={login.phone} />}
        {login.temporaryPassword && <SignInDetail label="Temporary password" value={login.temporaryPassword} secret />}
      </div>
      {!login.temporaryPassword && (
        <p className="text-label text-fg-muted">Already had a sign-in: they keep using their own password.</p>
      )}
    </div>
  );
}
