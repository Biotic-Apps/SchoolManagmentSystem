import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ImportFlow } from "../../use-import-flow";
import { ImportCommitBar } from "./ImportCommitBar";
import { ImportErrorsTable } from "./ImportErrorsTable";
import { ImportPreviewTable } from "./ImportPreviewTable";
import { ImportStatusPanel } from "./ImportStatusPanel";
import { ImportTotals } from "./ImportTotals";
import { ReconciliationSummary } from "./ReconciliationSummary";

/** Status, totals, problems, preview and commit for the import being worked on. */
export function ImportResult({ flow }: { flow: ImportFlow }) {
  if (!flow.importId) return null;
  if (flow.detailLoading) return <Skeleton className="h-64 w-full" />;
  if (flow.detailError || !flow.detail) {
    return (
      <Card>
        <ErrorState error={flow.detailError} onRetry={flow.retryDetail} />
      </Card>
    );
  }

  const { detail } = flow;
  const showResults = detail.status !== "VALIDATING";

  return (
    <Card className="flex min-w-0 flex-col gap-6 p-5">
      <ImportStatusPanel flow={flow} />
      {showResults && <ImportTotals totals={flow.totals} />}
      <ImportCommitBar flow={flow} />
      {detail.status === "COMMITTED" && <ReconciliationSummary detail={detail} />}
      {showResults && <ImportErrorsTable errors={detail.errors} />}
      {showResults && <ImportPreviewTable preview={detail.preview} />}
      <div className="flex justify-end">
        <Button variant="ghost" onClick={flow.reset} disabled={flow.busy}>
          Start a new import
        </Button>
      </div>
    </Card>
  );
}
