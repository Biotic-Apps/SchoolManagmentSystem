import { InlineNotice } from "@/components/shared/InlineNotice";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { errorMessage } from "@/lib/error-messages";
import type { ImportContextState } from "../../use-import-context";
import { ImportKindSelect } from "./ImportKindSelect";

export function ImportContextPicker({ context, disabled }: { context: ImportContextState; disabled?: boolean }) {
  if (context.branchesLoading) return <Skeleton className="h-40 w-full" />;
  if (context.branchesError) return <InlineNotice tone="error">{errorMessage(context.branchesError)}</InlineNotice>;
  if (context.branchOptions.length === 0) {
    return <InlineNotice tone="warning">This school has no active branch to import into.</InlineNotice>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Branch</Label>
          <OptionSelect
            label="Branch"
            options={context.branchOptions}
            value={context.branchId}
            onChange={context.setBranchId}
            disabled={disabled}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Academic session</Label>
          {context.sessionsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <OptionSelect
              label="Academic session"
              options={context.sessionOptions}
              value={context.sessionId}
              onChange={context.setSessionId}
              disabled={disabled}
            />
          )}
          {!context.sessionsLoading && context.sessionOptions.length === 0 && (
            <p className="text-caption text-fg-muted">Create an academic session for this branch first.</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>What to import</Label>
        <ImportKindSelect value={context.kind} onChange={context.setKind} disabled={disabled} />
      </div>
    </div>
  );
}
