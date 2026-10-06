import { Banknote, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatPeriod } from "@/lib/period";

interface CreateRunEmptyProps {
  month: string;
  canCreate: boolean;
  creating: boolean;
  onCreate: () => void;
}

export function CreateRunEmpty({ month, canCreate, creating, onCreate }: CreateRunEmptyProps) {
  return (
    <div className="rounded-card border border-border bg-surface">
      <EmptyState
        icon={Banknote}
        title={`No payroll run for ${formatPeriod(month)}`}
        description={
          canCreate
            ? "Create the run, then calculate salaries from structures, unpaid leave and adjustments."
            : "The accountant creates the payroll run for each month."
        }
        action={
          canCreate && (
            <Button loading={creating} onClick={onCreate}>
              <Plus />
              Create payroll run
            </Button>
          )
        }
      />
    </div>
  );
}
