import { InlineNotice } from "@/components/shared/InlineNotice";
import { formatDateTime } from "@/lib/format";
import type { Register } from "../types";

function byLine(register: Register): string {
  if (!register.submittedBy) return "";
  const proxy = register.onBehalfOf ? ` on behalf of ${register.onBehalfOf.name}` : "";
  return ` by ${register.submittedBy.name}${proxy}`;
}

/** Explains why a register is read-only. */
export function RegisterBanner({ register, isHelper }: { register: Register; isHelper: boolean }) {
  switch (register.status) {
    case "SUBMITTED":
      return (
        <InlineNotice tone="info">
          Submitted{byLine(register)}. It locks automatically at the branch lock time.
        </InlineNotice>
      );
    case "LOCKED":
      return (
        <InlineNotice tone="info">
          Locked{register.lockedAt ? ` on ${formatDateTime(register.lockedAt)}` : ""} (submitted{byLine(register)}).
          Changes need a correction request approved by the principal.
        </InlineNotice>
      );
    case "PENDING_REVIEW":
      return (
        <InlineNotice tone="warning">
          Waiting for your reviewer — the register applies once they approve it.
        </InlineNotice>
      );
    case "DRAFT":
      return isHelper ? (
        <InlineNotice tone="info">Saved as a draft. The class teacher reviews and submits it.</InlineNotice>
      ) : null;
    default:
      return null;
  }
}
