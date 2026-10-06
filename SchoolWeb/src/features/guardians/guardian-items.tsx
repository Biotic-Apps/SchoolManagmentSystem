import type { DetailItem } from "@/components/shared/DetailList";
import { RELATION_OPTIONS, optionName } from "@/features/people/options";
import { textOrDash } from "@/lib/format";
import { AccountBadge } from "./components/AccountBadge";
import type { Guardian } from "./types";

export function guardianItems(guardian: Guardian): DetailItem[] {
  return [
    { label: "Phone", value: textOrDash(guardian.phone) },
    { label: "Email", value: textOrDash(guardian.email) },
    { label: "CNIC", value: textOrDash(guardian.cnic) },
    { label: "Occupation", value: textOrDash(guardian.occupation) },
    { label: "Address", value: textOrDash(guardian.address) },
    { label: "Relation", value: textOrDash(optionName(RELATION_OPTIONS, guardian.relation)) },
    { label: "Account", value: <AccountBadge hasAccount={guardian.hasAccount} /> },
  ];
}
