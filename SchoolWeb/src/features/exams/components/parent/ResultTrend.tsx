import { ProgressBar } from "@/components/shared/ProgressBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { TrendPoint } from "../../use-child-results";

/** Overall percent per published exam, in exam order. */
export function ResultTrend({ points }: { points: TrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress across exams</CardTitle>
        <CardDescription>Overall percentage in each published exam.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {points.map((point) => (
            <li key={point.examId} className="grid gap-1.5 sm:grid-cols-[12rem_1fr] sm:items-center sm:gap-4">
              <span className="text-label text-fg">{point.examName}</span>
              <ProgressBar percent={point.percent} label={`${point.examName} percentage`} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
