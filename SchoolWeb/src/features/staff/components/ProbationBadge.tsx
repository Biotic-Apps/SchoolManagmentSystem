import { Badge } from "@/components/ui/Badge";

/** Marks staff whose work is held for review (contract §8). */
export function ProbationBadge({ reviewerName }: { reviewerName?: string | null }) {
  return <Badge tone="warning">{reviewerName ? `Under review by ${reviewerName}` : "Under review"}</Badge>;
}
