import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { errorMessage } from "@/lib/error-messages";
import { EmptyState } from "./EmptyState";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <EmptyState
      icon={CircleAlert}
      title="Couldn't load this"
      description={errorMessage(error)}
      className={className}
      action={
        onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}
