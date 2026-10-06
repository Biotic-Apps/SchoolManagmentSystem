"use client";

import { useCallback, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import type { ImportSummary } from "../../import-types";
import { useImportContext } from "../../use-import-context";
import { useImportFlow } from "../../use-import-flow";
import { ImportContextPicker } from "./ImportContextPicker";
import { ImportHistory } from "./ImportHistory";
import { ImportResult } from "./ImportResult";
import { ImportUploadStep } from "./ImportUploadStep";
import { TemplateDownload } from "./TemplateDownload";

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-body font-semibold text-fg">
        {number}. {title}
      </h3>
      {children}
    </div>
  );
}

export function ImportsTab({ schoolId }: { schoolId: string }) {
  const context = useImportContext(schoolId);
  const flow = useImportFlow(context);
  const { open } = flow;
  const openImport = useCallback((item: ImportSummary) => open(item.id), [open]);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Card className="flex flex-col gap-6 p-5">
        <Step number={1} title="Choose what to import">
          <ImportContextPicker context={context} disabled={flow.uploading || flow.busy} />
        </Step>
        <Step number={2} title="Download the template">
          <TemplateDownload kind={context.kind} />
        </Step>
        <Step number={3} title="Upload the filled file">
          <ImportUploadStep flow={flow} disabled={!context.ready || flow.busy} />
        </Step>
      </Card>
      <ImportResult flow={flow} />
      <ImportHistory branchId={context.branchId} onOpen={openImport} />
    </div>
  );
}
