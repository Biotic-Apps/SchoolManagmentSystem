import { Badge } from "@/components/ui/Badge";

export function PassBadge({ passed }: { passed: boolean }) {
  return <Badge tone={passed ? "success" : "error"}>{passed ? "Pass" : "Fail"}</Badge>;
}
