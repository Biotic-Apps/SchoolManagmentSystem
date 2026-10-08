import { KeyRound } from "lucide-react";
import type { StaffDetail } from "../types";

/** "No sign-in account" or "Signs in as …" under the staff name. */
export function SignInStatus({ staff }: { staff: StaffDetail }) {
  const id = staff.login?.email ?? staff.login?.phone;
  return (
    <p className="flex min-w-0 items-start gap-1.5 text-label text-fg-muted">
      <KeyRound className="mt-0.5 size-4 shrink-0" aria-hidden />
      {staff.userId ? (
        <span className="min-w-0 break-all">
          Signs in as <span className="font-medium text-fg">{id ?? "their account"}</span>
        </span>
      ) : (
        <span className="font-medium text-warning">No sign-in account</span>
      )}
    </p>
  );
}
