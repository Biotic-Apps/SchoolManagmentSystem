import { Button } from "@/components/ui/Button";

interface SettingsFormActionsProps {
  dirty: boolean;
  submitting: boolean;
  onDiscard: () => void;
  /** Blocks saving for a reason shown elsewhere (e.g. a failing contrast check). */
  blocked?: boolean;
  saveLabel?: string;
}

/** Save / Discard bar at the bottom of a settings form. */
export function SettingsFormActions({ dirty, submitting, onDiscard, blocked, saveLabel = "Save changes" }: SettingsFormActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
      {dirty && <span className="mr-auto text-caption text-fg-muted">You have unsaved changes.</span>}
      <Button variant="secondary" onClick={onDiscard} disabled={!dirty || submitting}>
        Discard
      </Button>
      <Button type="submit" loading={submitting} disabled={!dirty || blocked}>
        {saveLabel}
      </Button>
    </div>
  );
}
