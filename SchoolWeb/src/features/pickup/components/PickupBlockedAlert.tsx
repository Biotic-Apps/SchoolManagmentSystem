import { ShieldAlert } from "lucide-react";

/** Shown in place of closing the dialog when the API refuses an unverified picker. */
export function PickupBlockedAlert() {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-card border border-error bg-error-soft p-4 text-error">
      <ShieldAlert className="mt-0.5 size-6 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="text-body font-semibold">Pickup blocked — this person is not verified.</p>
        <p className="text-label">The principal has been alerted. Do not release the student.</p>
      </div>
    </div>
  );
}
