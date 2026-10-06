import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { SyllabusPlan } from "../types";
import { PlanProgressSummary } from "./PlanProgressSummary";
import { PlanProgressView } from "./PlanProgressView";

export function ChildPlanCard({ plan }: { plan: SyllabusPlan }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.subjectName}</CardTitle>
        <PlanProgressSummary progress={plan.progress} label={`${plan.subjectName} progress`} />
      </CardHeader>
      <CardContent>
        <PlanProgressView plan={plan} />
      </CardContent>
    </Card>
  );
}
