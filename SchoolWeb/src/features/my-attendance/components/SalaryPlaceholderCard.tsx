import { WalletCards } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

/** Salary slips come with payroll (Phase 4); nothing is shown until then. */
export function SalaryPlaceholderCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary</CardTitle>
        <CardDescription>Monthly salary slips and deductions.</CardDescription>
      </CardHeader>
      <EmptyState
        icon={WalletCards}
        title="Salary slips are not available yet"
        description="Your salary slips will appear here once payroll is set up for your school."
      />
    </Card>
  );
}
