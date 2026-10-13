import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { hasErrorCode } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { EmptyState } from "./EmptyState";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

/**
 * VALIDATION_FAILED is a form-centric message ("Some fields need attention…").
 * ErrorState is only used for data-loading errors, never for form submissions,
 * so we replace it with a generic message that makes sense when no form is visible.
 */
function loadErrorMessage(error: unknown): string {
  if (hasErrorCode(error, "VALIDATION_FAILED")) {
    return "Something went wrong while loading. Please try again.";
  }
  return errorMessage(error);
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <EmptyState
      icon={CircleAlert}
      tone="error"
      title="Couldn't load this"
      description={loadErrorMessage(error)}
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
