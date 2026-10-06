import type { ClearanceDetails } from "./types";

/** Normalises 409 CLEARANCE_REQUIRED details; unknown shapes yield an empty block. */
export function clearanceFrom(details: unknown): ClearanceDetails {
  if (!details || typeof details !== "object") return {};
  const raw = details as Record<string, unknown>;
  const amount = (value: unknown) => (typeof value === "number" ? value : null);
  const items = Array.isArray(raw.items)
    ? raw.items
        .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
        .map((item) => ({
          name: String(item.name ?? item.itemName ?? "Item"),
          quantity: typeof item.quantity === "number" ? item.quantity : null,
        }))
    : null;
  const reasons = Array.isArray(raw.reasons) ? raw.reasons.map(String) : null;
  return {
    outstandingMinor: amount(raw.outstandingMinor),
    balanceMinor: amount(raw.balanceMinor),
    currency: typeof raw.currency === "string" ? raw.currency : null,
    items,
    reasons,
  };
}
