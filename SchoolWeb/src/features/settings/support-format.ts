import { EMPTY_VALUE } from "@/lib/format";
import type { FailedRecipient, LastBackupInfo } from "./support-types";

export function recipientParts(recipient: FailedRecipient | null): { name: string; contact?: string } {
  if (!recipient) return { name: EMPTY_VALUE };
  if (typeof recipient === "string") return { name: recipient };
  return { name: recipient.name || recipient.contact || EMPTY_VALUE, contact: recipient.name ? recipient.contact ?? undefined : undefined };
}

export function lastBackupAt(value: LastBackupInfo): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.finishedAt ?? value.startedAt ?? null;
}
