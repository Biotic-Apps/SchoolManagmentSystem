import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyText } from "@/components/shared/MoneyText";
import type { ClearanceDetails } from "../types";

/** Shown when approval or issue hits 409 CLEARANCE_REQUIRED. */
export function ClearanceBlockedNotice({ clearance }: { clearance: ClearanceDetails }) {
  const balance = clearance.outstandingMinor ?? clearance.balanceMinor ?? null;
  const items = clearance.items ?? [];
  const reasons = clearance.reasons ?? [];

  return (
    <InlineNotice tone="warning">
      <div className="flex flex-col gap-2">
        <p className="font-medium">Clearance needed before approval</p>
        <ul className="flex list-disc flex-col gap-1 pl-4">
          {balance !== null && balance > 0 && (
            <li>
              Outstanding fee balance: <MoneyText amountMinor={balance} currency={clearance.currency ?? undefined} />
            </li>
          )}
          {items.map((item, index) => (
            <li key={`${item.name}:${index}`}>
              Not returned: {item.name}
              {item.quantity ? ` × ${item.quantity}` : ""}
            </li>
          ))}
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <p>Collect the balance in Fees and record the returned items in Inventory, then approve again.</p>
      </div>
    </InlineNotice>
  );
}
