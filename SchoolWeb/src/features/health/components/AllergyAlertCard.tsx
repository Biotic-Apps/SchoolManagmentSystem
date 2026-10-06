import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import type { HealthAlert } from "../types";
import { AllergyList } from "./AllergyList";

export function AllergyAlertCard({ alert }: { alert: HealthAlert }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <Link href={`/students/${alert.studentId}`} className="truncate text-body font-semibold text-fg hover:text-primary">
          {alert.name}
        </Link>
        {alert.allergies.length > 0 && <AllergyList allergies={alert.allergies} />}
        {!!alert.conditions?.length && (
          <p className="text-label text-fg">
            <span className="text-fg-muted">Conditions: </span>
            {alert.conditions.join(", ")}
          </p>
        )}
        {alert.instructions && (
          <p className="whitespace-pre-line rounded-input bg-warning-soft px-3 py-2 text-label text-warning">
            {alert.instructions}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
