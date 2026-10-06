import { Badge } from "@/components/ui/Badge";

/** Whether the guardian can sign in to the parent app. */
export function AccountBadge({ hasAccount }: { hasAccount: boolean }) {
  return <Badge tone={hasAccount ? "success" : "neutral"}>{hasAccount ? "Has account" : "No account"}</Badge>;
}
