import { CalendarOff } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/Card";

export function NonWorkingDayState() {
  return (
    <Card>
      <EmptyState
        icon={CalendarOff}
        title="No school on this day"
        description="This date is a holiday or a non-working day in the branch calendar. Pick another day."
      />
    </Card>
  );
}
