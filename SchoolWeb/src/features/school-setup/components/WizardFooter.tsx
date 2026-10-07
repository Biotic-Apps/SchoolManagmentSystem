import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface WizardFooterProps {
  step: number;
  total: number;
  last: boolean;
  submitting: boolean;
  onBack: () => void;
  onCancel: () => void;
  className?: string;
}

/** Sticky footer: Cancel and progress on the left, Back / Next (or Create) on the right. */
export function WizardFooter({ step, total, last, submitting, onBack, onCancel, className }: WizardFooterProps) {
  return (
    <footer className={cn("flex shrink-0 items-center justify-between gap-3 border-t border-border bg-surface py-4", className)}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={submitting} className="max-sm:px-2">
          Cancel
        </Button>
        <span className="hidden text-caption text-fg-muted sm:inline">
          Step {step + 1} of {total}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {step > 0 && (
          <Button variant="secondary" onClick={onBack} disabled={submitting}>
            <ArrowLeft />
            Back
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {last ? "Create school" : "Next"}
          {!last && <ArrowRight />}
        </Button>
      </div>
    </footer>
  );
}
