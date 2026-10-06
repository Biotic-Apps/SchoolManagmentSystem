import { LayoutGrid } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";

export function NoSectionState({ error }: { error?: unknown }) {
  return (
    <Card>
      {error ? (
        <ErrorState error={error} />
      ) : (
        <EmptyState
          icon={LayoutGrid}
          title="No section in your scope"
          description="Progress is recorded for the sections you are assigned to in the active session."
        />
      )}
    </Card>
  );
}
