import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { importKindLabel } from "../../import-kinds";
import type { ImportKind } from "../../import-types";
import { useTemplateDownload } from "../../use-template-download";

export function TemplateDownload({ kind }: { kind: ImportKind }) {
  const { download, downloading } = useTemplateDownload();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-label text-fg-muted">
        Fill in the {importKindLabel(kind).toLowerCase()} template. Its instructions sheet lists every column and format.
      </p>
      <Button variant="secondary" loading={downloading} onClick={() => void download(kind)}>
        <Download />
        Download template
      </Button>
    </div>
  );
}
