import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface SettingsQueryStateProps {
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
}

/** Loading skeleton or error card shown before a settings form has its data. */
export function SettingsQueryState({ isPending, error, onRetry }: SettingsQueryStateProps) {
  if (isPending) {
    return (
      <Card className="flex flex-col gap-4 p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }
  return (
    <Card>
      <ErrorState error={error} onRetry={onRetry} />
    </Card>
  );
}
